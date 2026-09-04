import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { cleanImei } from '@tekshir/shared';

@Injectable()
export class CryptoService {
  private readonly secretKey: string;

  constructor() {
    this.secretKey = process.env.SERVER_SECRET_KEY || 'tekshir-default-secure-server-secret-key-2026';
  }

  /**
   * Deterministic keyed hash for indexed lookup of IMEI.
   * HMAC-SHA256(cleaned_imei, secret_key)
   */
  hashImei(imei: string): string {
    const cleaned = cleanImei(imei);
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(cleaned)
      .digest('hex');
  }

  /**
   * Generates a unique random request reference ID.
   */
  generateRequestId(): string {
    return 'VRF-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  }
}
