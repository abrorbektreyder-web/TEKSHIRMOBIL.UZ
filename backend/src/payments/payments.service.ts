import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly creditsService: CreditsService,
  ) {}

  /**
   * Creates an initial pending payment order for a package.
   */
  async createPayment(userId: string, packageId: string, provider: string = 'PAYME') {
    const pkg = await this.prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!pkg || pkg.status !== 'ACTIVE') {
      throw new BadRequestException('Tanlangan paket mavjud emas yoki faol emas');
    }

    const idempotencyKey = 'PAY-' + crypto.randomUUID();

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        packageId,
        amount: pkg.price,
        provider: provider.toUpperCase(),
        status: 'PENDING',
        idempotencyKey,
      },
      include: { package: true },
    });

    // Generate mock or real provider checkout URLs
    let checkoutUrl = `/checkout?paymentId=${payment.id}`;
    if (provider === 'CLICK') {
      checkoutUrl = `https://my.click.uz/services/pay?service_id=mock&merchant_id=mock&amount=${pkg.price}&transaction_param=${payment.id}`;
    } else if (provider === 'PAYME') {
      checkoutUrl = `https://checkout.paycom.uz/${Buffer.from(`m=mock;ac.payment_id=${payment.id};a=${pkg.price * 100}`).toString('base64')}`;
    }

    return {
      paymentId: payment.id,
      amount: payment.amount,
      package: {
        id: pkg.id,
        name: pkg.name,
        credits: pkg.credits,
      },
      provider: payment.provider,
      status: payment.status,
      checkoutUrl,
    };
  }

  /**
   * Completes payment and grants credits idempotently (used for Webhooks / Mock completion in MVP).
   */
  async completePayment(paymentId: string, providerTxId?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { package: true },
    });

    if (!payment) {
      throw new NotFoundException('To‘lov topilmadi');
    }

    if (payment.status === 'PAID') {
      // Already paid, return existing state (idempotency)
      return { success: true, message: 'To‘lov allaqachon bajarilgan', payment };
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestException(`To‘lov holati yaroqsiz: ${payment.status}`);
    }

    // Update payment status
    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        providerTransactionId: providerTxId || 'TX-' + Date.now(),
      },
    });

    // Grant credits strictly once
    const creditTx = await this.creditsService.grantCredits(
      payment.userId,
      payment.package.credits,
      'PAYMENT',
      payment.id,
      `CREDIT-PAY-${payment.id}`,
    );

    return {
      success: true,
      message: 'To‘lov muvaffaqiyatli yakunlandi va hisobga kreditlar qo‘shildi',
      creditsGranted: payment.package.credits,
      balanceAfter: creditTx.balanceAfter,
      payment: updatedPayment,
    };
  }

  /**
   * Retrieves user's payments history.
   */
  async getUserPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: { package: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
