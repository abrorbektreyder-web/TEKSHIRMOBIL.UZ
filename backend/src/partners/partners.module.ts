import { Module } from '@nestjs/common';
import { PartnersService } from './partners.service';
import { PartnersController } from './partners.controller';
import { CryptoService } from '../verification/crypto.service';

@Module({
  controllers: [PartnersController],
  providers: [PartnersService, CryptoService],
  exports: [PartnersService],
})
export class PartnersModule {}
