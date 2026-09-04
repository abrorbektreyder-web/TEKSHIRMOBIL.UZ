import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../verification/crypto.service';
import { cleanImei, isValidImei, maskImei } from '@tekshir/shared';

@Injectable()
export class PartnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {}

  async listAllPartners() {
    return this.prisma.partner.findMany({
      include: {
        apiConfig: true,
        _count: {
          select: { devices: true, importBatches: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPartnerById(id: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { id },
      include: {
        apiConfig: true,
        _count: { select: { devices: true } },
      },
    });
    if (!partner) {
      throw new NotFoundException('Hamkor topilmadi');
    }
    return partner;
  }

  async createPartner(data: {
    name: string;
    integrationType: 'API' | 'CABINET' | 'CSV';
    status?: string;
    endpointRef?: string;
    timeoutMs?: number;
    credentials?: string;
  }) {
    const partner = await this.prisma.partner.create({
      data: {
        name: data.name,
        integrationType: data.integrationType,
        status: data.status || 'ACTIVE',
      },
    });

    if (data.integrationType === 'API' && data.endpointRef) {
      await this.prisma.partnerApiConfig.create({
        data: {
          partnerId: partner.id,
          endpointRef: data.endpointRef,
          timeoutMs: data.timeoutMs || 3000,
          encryptedCredentials: data.credentials,
        },
      });
    }

    return this.getPartnerById(partner.id);
  }

  async updatePartnerStatus(id: string, status: string) {
    return this.prisma.partner.update({
      where: { id },
      data: { status },
    });
  }

  // --- PARTNER CABINET FUNCTIONS ---

  async getPartnerDevices(partnerId: string, search?: string) {
    let whereClause: any = { partnerId };
    if (search) {
      const cleaned = cleanImei(search);
      if (cleaned.length === 15) {
        const hash = this.cryptoService.hashImei(cleaned);
        whereClause = { partnerId, imeiHash: hash };
      } else {
        whereClause = {
          partnerId,
          maskedImei: { contains: search },
        };
      }
    }

    return this.prisma.partnerDevice.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
  }

  async addOrUpdateDevice(
    partnerId: string,
    rawImei: string,
    status: 'ACTIVE' | 'PAID' | 'BLOCKED',
    sourceType: 'CABINET' | 'CSV' = 'CABINET',
    importBatchId?: string,
  ) {
    const cleaned = cleanImei(rawImei);
    if (cleaned.length !== 15 || !isValidImei(cleaned)) {
      throw new BadRequestException(`IMEI raqami noto‘g‘ri yoki Luhn tekshiruvidan o‘tmadi: ${rawImei}`);
    }

    const imeiHash = this.cryptoService.hashImei(cleaned);
    const masked = maskImei(cleaned);

    return this.prisma.partnerDevice.upsert({
      where: {
        partnerId_imeiHash: {
          partnerId,
          imeiHash,
        },
      },
      update: {
        status,
        updatedAt: new Date(),
      },
      create: {
        partnerId,
        imeiHash,
        maskedImei: masked,
        status,
        sourceType,
        importBatchId,
      },
    });
  }

  async deleteDevice(partnerId: string, deviceId: string) {
    return this.prisma.partnerDevice.deleteMany({
      where: { id: deviceId, partnerId },
    });
  }

  /**
   * Processes CSV file upload with strict row validation and audit batch creation.
   */
  async importCsv(partnerId: string, fileName: string, csvContent: string) {
    const lines = csvContent.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) {
      throw new BadRequestException('CSV fayli bo‘sh');
    }

    // Check header
    let startIndex = 0;
    const header = lines[0].toLowerCase();
    if (header.includes('imei') && header.includes('status')) {
      startIndex = 1;
    }

    let successCount = 0;
    let failCount = 0;
    const errors: Array<{ line: number; row: string; error: string }> = [];

    // Pre-create batch
    const batch = await this.prisma.partnerImportBatch.create({
      data: {
        partnerId,
        fileName,
        rowCount: lines.length - startIndex,
        successCount: 0,
        failCount: 0,
      },
    });

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(/[,;\t]/).map((p) => p.trim());
      const rawImei = parts[0] || '';
      const rawStatus = (parts[1] || 'ACTIVE').toUpperCase() as any;

      const validStatuses = ['ACTIVE', 'PAID', 'BLOCKED'];
      const status = validStatuses.includes(rawStatus) ? rawStatus : 'ACTIVE';

      const cleaned = cleanImei(rawImei);

      if (cleaned.length !== 15 || !isValidImei(cleaned)) {
        failCount++;
        errors.push({
          line: i + 1,
          row: line,
          error: '15 xonali emas yoki Luhn tekshiruvidan o‘tmadi',
        });
        continue;
      }

      try {
        await this.addOrUpdateDevice(partnerId, cleaned, status, 'CSV', batch.id);
        successCount++;
      } catch (err: any) {
        failCount++;
        errors.push({
          line: i + 1,
          row: line,
          error: err.message,
        });
      }
    }

    // Update batch report
    const updatedBatch = await this.prisma.partnerImportBatch.update({
      where: { id: batch.id },
      data: {
        successCount,
        failCount,
        reportJson: JSON.stringify(errors.slice(0, 50)),
      },
    });

    return {
      batchId: updatedBatch.id,
      totalRows: lines.length - startIndex,
      successCount,
      failCount,
      errors: errors.slice(0, 20),
    };
  }

  async getPartnerImportBatches(partnerId: string) {
    return this.prisma.partnerImportBatch.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
