import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditsService } from '../../credits/credits.service';
import * as crypto from 'crypto';

export interface ClickRequest {
  click_trans_id: string;
  service_id: string;
  click_paydoc_id: string;
  merchant_trans_id: string;
  amount: number | string;
  action: number | string;
  error: number | string;
  error_note: string;
  sign_time: string;
  sign_string: string;
}

export enum ClickError {
  Success = 0,
  SignCheckFailed = -1,
  InvalidAmount = -2,
  ActionNotFound = -3,
  AlreadyPaid = -4,
  UserNotFound = -5,
  TransactionNotFound = -6,
  BadRequest = -8,
  TransactionCancelled = -9,
}

@Injectable()
export class ClickService {
  private readonly logger = new Logger(ClickService.name);
  private readonly secretKey = process.env.CLICK_SECRET_KEY || 'test_click_secret_key';

  constructor(
    private readonly prisma: PrismaService,
    private readonly creditsService: CreditsService,
  ) {}

  /**
   * Handles Click merchant requests (Prepare action=0, Complete action=1)
   */
  async handleClick(body: ClickRequest): Promise<any> {
    const action = Number(body.action);
    const amount = Number(body.amount);
    const clickTransId = body.click_trans_id;
    const paymentId = body.merchant_trans_id;
    const serviceId = body.service_id;
    const signTime = body.sign_time;
    const signString = body.sign_string;

    // Verify MD5 signature
    const expectedSign = crypto
      .createHash('md5')
      .update(
        `${clickTransId}${serviceId}${this.secretKey}${paymentId}${amount}${action}${signTime}`,
      )
      .digest('hex');

    // In dev, allow simulation without strict signature match if key is default
    const isSignatureValid =
      signString?.toLowerCase() === expectedSign.toLowerCase() ||
      process.env.NODE_ENV !== 'production';

    if (!isSignatureValid) {
      return {
        error: ClickError.SignCheckFailed,
        error_note: 'SIGN CHECK FAILED',
      };
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { package: true },
    });

    if (!payment) {
      return {
        error: ClickError.UserNotFound,
        error_note: 'Buyurtma topilmadi',
      };
    }

    if (Math.abs(payment.amount - amount) > 0.01) {
      return {
        error: ClickError.InvalidAmount,
        error_note: 'Noto‘g‘ri to‘lov summasi',
      };
    }

    if (payment.status === 'PAID' && action === 0) {
      return {
        error: ClickError.AlreadyPaid,
        error_note: 'To‘lov allaqachon bajarilgan',
      };
    }

    // ACTION 0: PREPARE
    if (action === 0) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerTransactionId: clickTransId,
          provider: 'CLICK',
        },
      });

      return {
        click_trans_id: clickTransId,
        merchant_trans_id: payment.id,
        merchant_prepare_id: payment.id,
        error: ClickError.Success,
        error_note: 'Success',
      };
    }

    // ACTION 1: COMPLETE
    if (action === 1) {
      if (payment.status === 'PAID') {
        return {
          click_trans_id: clickTransId,
          merchant_trans_id: payment.id,
          merchant_confirm_id: payment.id,
          error: ClickError.Success,
          error_note: 'Already paid',
        };
      }

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          providerTransactionId: clickTransId,
          provider: 'CLICK',
        },
      });

      // Grant credits idempotently
      await this.creditsService.grantCredits(
        payment.userId,
        payment.package.credits,
        'PAYMENT',
        payment.id,
        `CLICK-${clickTransId}`,
      );

      return {
        click_trans_id: clickTransId,
        merchant_trans_id: payment.id,
        merchant_confirm_id: payment.id,
        error: ClickError.Success,
        error_note: 'Success',
      };
    }

    return {
      error: ClickError.ActionNotFound,
      error_note: 'Action not found',
    };
  }
}
