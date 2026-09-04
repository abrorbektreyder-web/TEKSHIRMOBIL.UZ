import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymeService } from './protocols/payme.service';
import { ClickService } from './protocols/click.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  packageId: string;

  @IsString()
  @IsOptional()
  provider?: string;
}

class WebhookDto {
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @IsString()
  @IsOptional()
  providerTxId?: string;
}

@Controller('api/v1/payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymeService: PaymeService,
    private readonly clickService: ClickService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPayment(@CurrentUser('id') userId: string, @Body() body: CreatePaymentDto) {
    return this.paymentsService.createPayment(userId, body.packageId, body.provider);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyPayments(@CurrentUser('id') userId: string) {
    return this.paymentsService.getUserPayments(userId);
  }

  // Simulation / Webhook endpoint to mark payment as PAID and award credits
  @Post(':id/complete')
  async completePayment(
    @Param('id') paymentId: string,
    @Body() body?: { providerTxId?: string },
  ) {
    return this.paymentsService.completePayment(paymentId, body?.providerTxId);
  }

  @Post('webhook')
  async handleWebhook(@Body() body: WebhookDto) {
    return this.paymentsService.completePayment(body.paymentId, body.providerTxId);
  }

  /**
   * Official Payme JSON-RPC 2.0 Merchant Endpoint
   */
  @Post('payme')
  @HttpCode(200)
  async handlePaymeRpc(
    @Body() body: any,
    @Headers('authorization') authHeader?: string,
  ) {
    return this.paymeService.handleRpc(body, authHeader);
  }

  /**
   * Official Click Merchant Endpoint (Prepare & Complete)
   */
  @Post('click')
  @HttpCode(200)
  async handleClickWebhook(@Body() body: any) {
    return this.clickService.handleClick(body);
  }
}
