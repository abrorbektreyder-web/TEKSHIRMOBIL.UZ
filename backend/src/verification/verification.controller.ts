import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { VerificationEngineService } from './verification-engine.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { IsString, IsNotEmpty } from 'class-validator';

class VerifyImeiDto {
  @IsString()
  @IsNotEmpty()
  imei: string;
}

@Controller('api/v1/verifications')
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(private readonly verificationService: VerificationEngineService) {}

  @Post()
  async verify(@CurrentUser('id') userId: string, @Body() body: VerifyImeiDto) {
    return this.verificationService.verifyImei(userId, body.imei);
  }

  @Get()
  async getHistory(@CurrentUser('id') userId: string) {
    return this.verificationService.getVerificationHistory(userId);
  }

  @Get(':id')
  async getDetail(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.verificationService.getVerificationDetail(userId, id);
  }
}
