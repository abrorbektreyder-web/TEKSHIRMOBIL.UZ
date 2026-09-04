import { IPartnerAdapter } from './partner-adapter.interface';
import { NormalizedPartnerResult } from '@tekshir/shared';

export class ApiPartnerAdapter implements IPartnerAdapter {
  constructor(
    public readonly partnerId: string,
    public readonly partnerName: string,
    private readonly endpointUrl: string,
    private readonly timeoutMs: number = 3000,
    private readonly credentials?: string,
  ) {}

  async verify(imei: string, imeiHash: string): Promise<NormalizedPartnerResult> {
    const start = Date.now();

    // If endpoint is marked as internal mock / simulation
    if (this.endpointUrl.startsWith('mock://') || this.endpointUrl.startsWith('sim://')) {
      // If dynamic mock: active only for test prefix 356999...
      let isSimulatedActive = false;
      if (this.endpointUrl.includes('status=ACTIVE')) {
        isSimulatedActive = true;
      } else if (this.endpointUrl.includes('status=DYNAMIC')) {
        isSimulatedActive = imei.startsWith('356999');
      }

      return {
        partnerId: this.partnerId,
        partnerName: this.partnerName,
        sourceType: 'API',
        found: isSimulatedActive,
        status: isSimulatedActive ? 'ACTIVE' : undefined,
        latencyMs: 65,
        isAuthoritative: true,
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.credentials ? { Authorization: `Bearer ${this.credentials}` } : {}),
        },
        body: JSON.stringify({ imei }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - start;

      if (!response.ok) {
        return {
          partnerId: this.partnerId,
          partnerName: this.partnerName,
          sourceType: 'API',
          found: false,
          latencyMs,
          rawError: `HTTP Error: ${response.status} ${response.statusText}`,
          isAuthoritative: false,
        };
      }

      const data: any = await response.json();

      return {
        partnerId: this.partnerId,
        partnerName: this.partnerName,
        sourceType: 'API',
        found: !!data.found,
        status: data.status,
        latencyMs,
        isAuthoritative: true,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - start;
      const isTimeout = error.name === 'AbortError';

      return {
        partnerId: this.partnerId,
        partnerName: this.partnerName,
        sourceType: 'API',
        found: false,
        latencyMs,
        rawError: isTimeout ? `Timeout after ${this.timeoutMs}ms` : error.message,
        isAuthoritative: false,
      };
    }
  }
}
