import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { CreditsModule } from '../credits/credits.module';
import { PaymeService } from './protocols/payme.service';
import { ClickService } from './protocols/click.service';

@Module({
  imports: [CreditsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymeService, ClickService],
  exports: [PaymentsService, PaymeService, ClickService],
})
export class PaymentsModule {}
