import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from './crypto.service';
import {
  cleanImei,
  isValidImei,
  maskImei,
  PublicVerificationResponse,
  NormalizedPartnerResult,
  VerificationResultCode,
} from '@tekshir/shared';
import { IPartnerAdapter } from '../partners/adapters/partner-adapter.interface';
import { ApiPartnerAdapter } from '../partners/adapters/api-partner.adapter';
import { CabinetPartnerAdapter } from '../partners/adapters/cabinet-partner.adapter';
import { CsvPartnerAdapter } from '../partners/adapters/csv-partner.adapter';
import { CreditsService } from '../credits/credits.service';

@Injectable()
export class VerificationEngineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly creditsService: CreditsService,
  ) {}

  async verifyImei(userId: string, rawImei: string): Promise<PublicVerificationResponse> {
    const cleaned = cleanImei(rawImei);

    // 1. IMEI validation
    if (cleaned.length !== 15 || !isValidImei(cleaned)) {
      throw new BadRequestException('IMEI noto‘g‘ri. 15 xonali to‘g‘ri IMEI raqamini kiriting.');
    }

    // 2. Credit check
    const currentCredits = await this.creditsService.getUserCredits(userId);
    if (currentCredits <= 0) {
      throw new HttpException(
        {
          message: 'Tekshiruv uchun kredit yetarli emas. Iltimos, paket xarid qiling.',
          credits: 0,
          requiredCredits: 1,
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const imeiHash = this.cryptoService.hashImei(cleaned);
    const masked = maskImei(cleaned);
    const requestId = this.cryptoService.generateRequestId();

    // 3. Create VerificationRequest with status PROCESSING
    const request = await this.prisma.verificationRequest.create({
      data: {
        userId,
        requestId,
        imeiHash,
        maskedImei: masked,
        status: 'PROCESSING',
      },
    });

    const startTime = Date.now();

    // 4. Load all active partners and build adapters
    const activePartners = await this.prisma.partner.findMany({
      where: { status: 'ACTIVE' },
      include: { apiConfig: true },
    });

    const adapters: IPartnerAdapter[] = activePartners.map((partner) => {
      if (partner.integrationType === 'API') {
        const config = partner.apiConfig;
        return new ApiPartnerAdapter(
          partner.id,
          partner.name,
          config?.endpointRef || 'mock://verify?status=CLEAR',
          config?.timeoutMs || 3000,
          config?.encryptedCredentials || undefined,
        );
      } else if (partner.integrationType === 'CABINET') {
        return new CabinetPartnerAdapter(partner.id, partner.name, this.prisma);
      } else {
        return new CsvPartnerAdapter(partner.id, partner.name, this.prisma);
      }
    });

    // 5. Parallel execution with error isolation
    const settledResults = await Promise.allSettled(
      adapters.map((adapter) => adapter.verify(cleaned, imeiHash)),
    );

    const partnerResults: NormalizedPartnerResult[] = settledResults.map((res, index) => {
      const adapter = adapters[index];
      if (res.status === 'fulfilled') {
        return res.value;
      } else {
        return {
          partnerId: adapter.partnerId,
          partnerName: adapter.partnerName,
          sourceType: 'API',
          found: false,
          latencyMs: 3000,
          rawError: res.reason?.message || 'Unknown provider failure',
          isAuthoritative: false,
        };
      }
    });

    // 6. Save internal verification results to database
    if (partnerResults.length > 0) {
      await this.prisma.verificationResult.createMany({
        data: partnerResults.map((r) => ({
          verificationRequestId: request.id,
          partnerId: r.partnerId,
          partnerName: r.partnerName,
          sourceType: r.sourceType,
          found: r.found,
          status: r.status || null,
          latencyMs: r.latencyMs,
          rawError: r.rawError || null,
        })),
      });
    }

    // 7. Decision Engine (TZ 10.3 & 21.4)
    let finalStatus: VerificationResultCode = 'CLEAR';
    let matchedPartnerName: string | undefined = undefined;
    let matchedPartnerId: string | undefined = undefined;

    // Rule A: Check if any authoritative source FOUND + ACTIVE
    const activeMatch = partnerResults.find((r) => r.found && r.status === 'ACTIVE');

    if (activeMatch) {
      finalStatus = 'ACTIVE_INSTALLMENT';
      matchedPartnerName = activeMatch.partnerName;
      matchedPartnerId = activeMatch.partnerId;
    } else {
      // Rule B: Check if any provider failed
      const hasUnauthoritativeFailure = partnerResults.some((r) => !r.isAuthoritative);

      if (hasUnauthoritativeFailure && activePartners.length > 0) {
        // Provider unavailable: strictly forbidden to show CLEAR!
        finalStatus = 'PROVIDER_UNAVAILABLE';
      } else {
        // All authoritative sources answered and none found active installment
        finalStatus = 'CLEAR';
      }
    }

    const totalLatency = Date.now() - startTime;

    // 8. Deduct Credit ONLY if verification is authoritative and completed (ACTIVE_INSTALLMENT or CLEAR)
    let chargedTxId: string | undefined = undefined;
    let remainingCredits = currentCredits;

    if (finalStatus === 'ACTIVE_INSTALLMENT' || finalStatus === 'CLEAR') {
      const deductionTx = await this.creditsService.deductCredit(
        userId,
        1,
        'VERIFICATION',
        request.id,
        `DED-${request.id}`,
      );
      chargedTxId = deductionTx.id;
      remainingCredits = deductionTx.balanceAfter;
    }

    // 9. Update VerificationRequest record
    await this.prisma.verificationRequest.update({
      where: { id: request.id },
      data: {
        status: finalStatus,
        matchedPartnerId,
        matchedPartnerName,
        chargedCreditTxId: chargedTxId,
        latencyMs: totalLatency,
        completedAt: new Date(),
      },
    });

    // 10. Construct Normalized Public User Response
    let title = '';
    let message = '';

    if (finalStatus === 'ACTIVE_INSTALLMENT') {
      title = 'MUDDATLI TO‘LOV FAOL';
      message = `Ushbu qurilma muddatli to‘lov bilan bog‘langan. Do‘kon: ${matchedPartnerName || 'Hamkor do‘kon'}`;
    } else if (finalStatus === 'CLEAR') {
      title = 'MUDDATLI TO‘LOV BAZASIDA ANIQLANMADI';
      message = 'Ushbu qurilma muddatli to‘lov bilan bog‘langan qurilma sifatida aniqlanmadi.';
    } else {
      title = 'TEKSHIRUVNI AMALGA OSHIRIB BO‘LMADI';
      message = 'Hozirda qurilma holatini tekshirish imkoni mavjud emas. Kredit sarflanmadi. Keyinroq qayta urinib ko‘ring.';
    }

    return {
      requestId: request.requestId,
      result: finalStatus,
      title,
      message,
      partnerName: matchedPartnerName,
      maskedImei: masked,
      verifiedAt: new Date().toISOString(),
      creditsRemaining: remainingCredits,
    };
  }

  async getVerificationHistory(userId: string) {
    return this.prisma.verificationRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        requestId: true,
        maskedImei: true,
        status: true,
        matchedPartnerName: true,
        createdAt: true,
        completedAt: true,
      },
    });
  }

  async getVerificationDetail(userId: string, id: string) {
    const request = await this.prisma.verificationRequest.findFirst({
      where: { id, userId },
    });

    if (!request) {
      throw new NotFoundException('Tekshiruv natijasi topilmadi');
    }

    return request;
  }
}
