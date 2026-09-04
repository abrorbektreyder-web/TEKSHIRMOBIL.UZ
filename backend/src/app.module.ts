import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CreditsModule } from './credits/credits.module';
import { VerificationModule } from './verification/verification.module';
import { PartnersModule } from './partners/partners.module';
import { PackagesModule } from './packages/packages.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    TelegramModule,
    CreditsModule,
    AuthModule,
    PackagesModule,
    PaymentsModule,
    PartnersModule,
    VerificationModule,
    AdminModule,
  ],
})
export class AppModule {}
