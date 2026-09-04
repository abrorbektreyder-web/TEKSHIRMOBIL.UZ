import { NormalizedPartnerResult } from '@tekshir/shared';

export interface IPartnerAdapter {
  readonly partnerId: string;
  readonly partnerName: string;
  verify(imei: string, imeiHash: string): Promise<NormalizedPartnerResult>;
}
