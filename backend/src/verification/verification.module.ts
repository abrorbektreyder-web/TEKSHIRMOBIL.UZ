import { Module } from '@nestjs/common';
import { VerificationEngineService } from './verification-engine.service';
import { VerificationController } from './verification.controller';
import { CryptoService } from './crypto.service';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [CreditsModule],
  controllers: [VerificationController],
  providers: [VerificationEngineService, CryptoService],
  exports: [VerificationEngineService, CryptoService],
})
export class VerificationModule {}
