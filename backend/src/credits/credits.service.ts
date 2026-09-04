import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CreditsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves the current credit balance of a user.
   */
  async getUserCredits(userId: string): Promise<number> {
    const aggregate = await this.prisma.creditTransaction.aggregate({
      where: { userId },
      _sum: { credits: true },
    });

    return aggregate._sum.credits || 0;
  }

  /**
   * Grants credits to a user idempotently (e.g. after successful payment).
   */
  async grantCredits(
    userId: string,
    credits: number,
    referenceType: 'PAYMENT' | 'ADMIN',
    referenceId: string,
    idempotencyKey: string,
  ) {
    // Check if already processed
    const existing = await this.prisma.creditTransaction.findUnique({
      where: { idempotencyKey },
    });

    if (existing) {
      return existing;
    }

    const currentBalance = await this.getUserCredits(userId);
    const newBalance = currentBalance + credits;

    return this.prisma.creditTransaction.create({
      data: {
        userId,
        type: referenceType === 'PAYMENT' ? 'PACKAGE_PURCHASE' : 'ADMIN_ADJUSTMENT',
        credits,
        balanceAfter: newBalance,
        referenceType,
        referenceId,
        idempotencyKey,
      },
    });
  }

  /**
   * Deducts credit from a user for completed verification.
   */
  async deductCredit(
    userId: string,
    credits: number = 1,
    referenceType: 'VERIFICATION' | 'ADMIN',
    referenceId: string,
    idempotencyKey: string,
  ) {
    // Idempotency check
    const existing = await this.prisma.creditTransaction.findUnique({
      where: { idempotencyKey },
    });

    if (existing) {
      return existing;
    }

    const currentBalance = await this.getUserCredits(userId);
    if (currentBalance < credits) {
      throw new BadRequestException('Tekshiruv uchun kredit yetarli emas');
    }

    const newBalance = currentBalance - credits;

    return this.prisma.creditTransaction.create({
      data: {
        userId,
        type: referenceType === 'VERIFICATION' ? 'VERIFICATION_DEDUCTION' : 'ADMIN_ADJUSTMENT',
        credits: -credits,
        balanceAfter: newBalance,
        referenceType,
        referenceId,
        idempotencyKey,
      },
    });
  }
}
