import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditsService } from '../../credits/credits.service';

export interface PaymeRpcRequest {
  method: string;
  params: any;
  id: number | string;
}

export enum PaymeError {
  TransportError = -32300,
  AccessDenied = -32504,
  OrderNotFound = -31001,
  InvalidAmount = -31002,
  TransactionNotFound = -31003,
  CantDoOperation = -31008,
  AlreadyDone = -31050,
  Pending = -31051,
}

@Injectable()
export class PaymeService {
  private readonly logger = new Logger(PaymeService.name);
  private readonly paymeKey = process.env.PAYME_MERCHANT_KEY || 'test_payme_merchant_key';

  constructor(
    private readonly prisma: PrismaService,
    private readonly creditsService: CreditsService,
  ) {}

  /**
   * Main JSON-RPC 2.0 router for Payme Merchant API
   */
  async handleRpc(body: PaymeRpcRequest, authHeader?: string): Promise<any> {
    const { method, params, id } = body;

    // Optional basic auth check
    if (authHeader && process.env.NODE_ENV === 'production') {
      const isAuthorized = this.verifyAuth(authHeader);
      if (!isAuthorized) {
        return this.error(id, PaymeError.AccessDenied, 'Insufficient privileges');
      }
    }

    try {
      switch (method) {
        case 'CheckPerformTransaction':
          return await this.checkPerformTransaction(id, params);
        case 'CreateTransaction':
          return await this.createTransaction(id, params);
        case 'PerformTransaction':
          return await this.performTransaction(id, params);
        case 'CancelTransaction':
          return await this.cancelTransaction(id, params);
        case 'CheckTransaction':
          return await this.checkTransaction(id, params);
        case 'GetStatement':
          return await this.getStatement(id, params);
        default:
          return this.error(id, -32601, 'Method not found');
      }
    } catch (err: any) {
      this.logger.error(`Payme error in ${method}: ${err.message}`);
      return this.error(id, PaymeError.CantDoOperation, err.message);
    }
  }

  private verifyAuth(authHeader: string): boolean {
    if (!authHeader.startsWith('Basic ')) return false;
    const base64 = authHeader.replace('Basic ', '');
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    return parts[1] === this.paymeKey;
  }

  private async checkPerformTransaction(id: any, params: any) {
    const account = params.account || {};
    const paymentId = account.payment_id || account.order_id;
    const amountInTiyin = params.amount;

    if (!paymentId) {
      return this.error(id, PaymeError.OrderNotFound, 'Buyurtma topilmadi');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { package: true },
    });

    if (!payment) {
      return this.error(id, PaymeError.OrderNotFound, 'Buyurtma topilmadi');
    }

    // Payme sends amount in tiyin (1 UZS = 100 tiyin)
    const expectedTiyin = Math.round(payment.amount * 100);
    if (Math.abs(amountInTiyin - expectedTiyin) > 1) {
      return this.error(id, PaymeError.InvalidAmount, 'Noto‘g‘ri to‘lov summasi');
    }

    if (payment.status === 'PAID') {
      return this.error(id, PaymeError.AlreadyDone, 'Buyurtma allaqachon to‘langan');
    }

    return {
      jsonrpc: '2.0',
      id,
      result: {
        allow: true,
        detail: {
          receipt_type: 0,
          items: [
            {
              title: payment.package.name,
              price: expectedTiyin,
              count: 1,
              code: '10899002001000000',
              vat_percent: 0,
              package_code: '0',
            },
          ],
        },
      },
    };
  }

  private async createTransaction(id: any, params: any) {
    const paymeTransId = params.id;
    const paymentId = params.account?.payment_id || params.account?.order_id;
    const time = params.time;

    // Check if already created
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { package: true },
    });

    if (!payment) {
      return this.error(id, PaymeError.OrderNotFound, 'Buyurtma topilmadi');
    }

    if (payment.providerTransactionId === paymeTransId) {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          create_time: new Date(payment.createdAt).getTime(),
          transaction: payment.id,
          state: payment.status === 'PAID' ? 2 : 1,
        },
      };
    }

    if (payment.status === 'PAID') {
      return this.error(id, PaymeError.AlreadyDone, 'Buyurtma allaqachon to‘langan');
    }

    // Update payment with provider transaction id
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerTransactionId: paymeTransId,
        provider: 'PAYME',
      },
    });

    return {
      jsonrpc: '2.0',
      id,
      result: {
        create_time: time || Date.now(),
        transaction: payment.id,
        state: 1, // STATE_CREATED
      },
    };
  }

  private async performTransaction(id: any, params: any) {
    const paymeTransId = params.id;

    const payment = await this.prisma.payment.findFirst({
      where: { providerTransactionId: paymeTransId },
      include: { package: true },
    });

    if (!payment) {
      return this.error(id, PaymeError.TransactionNotFound, 'Tranzaksiya topilmadi');
    }

    if (payment.status === 'PAID') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          transaction: payment.id,
          perform_time: new Date(payment.updatedAt).getTime(),
          state: 2,
        },
      };
    }

    // Mark as PAID and grant credits idempotently
    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        updatedAt: new Date(),
      },
    });

    await this.creditsService.grantCredits(
      payment.userId,
      payment.package.credits,
      'PAYMENT',
      payment.id,
      `PAYME-${paymeTransId}`,
    );

    return {
      jsonrpc: '2.0',
      id,
      result: {
        transaction: payment.id,
        perform_time: new Date(updated.updatedAt).getTime(),
        state: 2, // STATE_COMPLETED
      },
    };
  }

  private async cancelTransaction(id: any, params: any) {
    const paymeTransId = params.id;
    const reason = params.reason;

    const payment = await this.prisma.payment.findFirst({
      where: { providerTransactionId: paymeTransId },
    });

    if (!payment) {
      return this.error(id, PaymeError.TransactionNotFound, 'Tranzaksiya topilmadi');
    }

    const wasPaid = payment.status === 'PAID';
    const newState = wasPaid ? -2 : -1;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: wasPaid ? 'REFUNDED' : 'CANCELLED',
      },
    });

    return {
      jsonrpc: '2.0',
      id,
      result: {
        transaction: payment.id,
        cancel_time: Date.now(),
        state: newState,
      },
    };
  }

  private async checkTransaction(id: any, params: any) {
    const paymeTransId = params.id;

    const payment = await this.prisma.payment.findFirst({
      where: { providerTransactionId: paymeTransId },
    });

    if (!payment) {
      return this.error(id, PaymeError.TransactionNotFound, 'Tranzaksiya topilmadi');
    }

    let state = 1;
    if (payment.status === 'PAID') state = 2;
    if (payment.status === 'CANCELLED') state = -1;
    if (payment.status === 'REFUNDED') state = -2;

    return {
      jsonrpc: '2.0',
      id,
      result: {
        create_time: new Date(payment.createdAt).getTime(),
        perform_time: payment.status === 'PAID' ? new Date(payment.updatedAt).getTime() : 0,
        cancel_time: payment.status === 'CANCELLED' || payment.status === 'REFUNDED' ? new Date(payment.updatedAt).getTime() : 0,
        transaction: payment.id,
        state,
        reason: null,
      },
    };
  }

  private async getStatement(id: any, params: any) {
    const fromDate = new Date(params.from || 0);
    const toDate = new Date(params.to || Date.now());

    const payments = await this.prisma.payment.findMany({
      where: {
        provider: 'PAYME',
        createdAt: { gte: fromDate, lte: toDate },
      },
      include: { package: true },
    });

    return {
      jsonrpc: '2.0',
      id,
      result: {
        transactions: payments.map((p) => ({
          id: p.providerTransactionId || p.id,
          time: new Date(p.createdAt).getTime(),
          amount: Math.round(p.amount * 100),
          account: { payment_id: p.id },
          create_time: new Date(p.createdAt).getTime(),
          perform_time: p.status === 'PAID' ? new Date(p.updatedAt).getTime() : 0,
          cancel_time: 0,
          transaction: p.id,
          state: p.status === 'PAID' ? 2 : 1,
          reason: null,
        })),
      },
    };
  }

  private error(id: any, code: number, message: string, data?: any) {
    return {
      jsonrpc: '2.0',
      id: id ?? null,
      error: {
        code,
        message,
        data,
      },
    };
  }
}
