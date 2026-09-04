import { IPartnerAdapter } from './partner-adapter.interface';
import { NormalizedPartnerResult } from '@tekshir/shared';
import { PrismaService } from '../../prisma/prisma.service';

export class CabinetPartnerAdapter implements IPartnerAdapter {
  constructor(
    public readonly partnerId: string,
    public readonly partnerName: string,
    private readonly prisma: PrismaService,
  ) {}

  async verify(imei: string, imeiHash: string): Promise<NormalizedPartnerResult> {
    const start = Date.now();
    try {
      const device = await this.prisma.partnerDevice.findFirst({
        where: {
          partnerId: this.partnerId,
          imeiHash: imeiHash,
          sourceType: 'CABINET',
        },
      });

      const latencyMs = Date.now() - start;

      if (!device) {
        return {
          partnerId: this.partnerId,
          partnerName: this.partnerName,
          sourceType: 'CABINET',
          found: false,
          latencyMs,
          isAuthoritative: true,
        };
      }

      return {
        partnerId: this.partnerId,
        partnerName: this.partnerName,
        sourceType: 'CABINET',
        found: true,
        status: device.status as any,
        latencyMs,
        isAuthoritative: true,
      };
    } catch (error: any) {
      return {
        partnerId: this.partnerId,
        partnerName: this.partnerName,
        sourceType: 'CABINET',
        found: false,
        latencyMs: Date.now() - start,
        rawError: error.message,
        isAuthoritative: false,
      };
    }
  }
}
