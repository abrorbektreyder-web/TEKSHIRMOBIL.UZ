import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardKpis() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      todayUsers,
      totalVerifications,
      todayVerifications,
      clearCount,
      activeCount,
      providerErrorCount,
      paidPayments,
      todayPaidPayments,
      activePartnersCount,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'USER' } }),
      this.prisma.user.count({ where: { role: 'USER', createdAt: { gte: today } } }),
      this.prisma.verificationRequest.count(),
      this.prisma.verificationRequest.count({ where: { createdAt: { gte: today } } }),
      this.prisma.verificationRequest.count({ where: { status: 'CLEAR' } }),
      this.prisma.verificationRequest.count({ where: { status: 'ACTIVE_INSTALLMENT' } }),
      this.prisma.verificationRequest.count({ where: { status: 'PROVIDER_UNAVAILABLE' } }),
      this.prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: { status: 'PAID', createdAt: { gte: today } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.partner.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      users: {
        total: totalUsers,
        today: todayUsers,
      },
      verifications: {
        total: totalVerifications,
        today: todayVerifications,
        clear: clearCount,
        activeInstallment: activeCount,
        providerUnavailable: providerErrorCount,
      },
      revenue: {
        total: paidPayments._sum.amount || 0,
        today: todayPaidPayments._sum.amount || 0,
        packagesSold: paidPayments._count,
        todayPackagesSold: todayPaidPayments._count,
      },
      partners: {
        activeCount: activePartnersCount,
      },
    };
  }

  async listUsers(search?: string) {
    return this.prisma.user.findMany({
      where: search
        ? {
            OR: [
              { phone: { contains: search } },
              { name: { contains: search } },
            ],
          }
        : undefined,
      include: {
        _count: { select: { verifications: true, payments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'BLOCKED') {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });
  }

  async listVerifications(limit: number = 50) {
    return this.prisma.verificationRequest.findMany({
      include: {
        user: { select: { phone: true, name: true } },
        results: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async listPayments(limit: number = 50) {
    return this.prisma.payment.findMany({
      include: {
        user: { select: { phone: true, name: true } },
        package: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async listAuditLogs(limit: number = 50) {
    return this.prisma.auditLog.findMany({
      include: {
        user: { select: { phone: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
