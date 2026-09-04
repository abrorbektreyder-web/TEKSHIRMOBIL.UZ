import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { PartnersService } from './partners.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { IsString, IsNotEmpty, IsIn } from 'class-validator';

class AddDeviceDto {
  @IsString()
  @IsNotEmpty()
  imei: string;

  @IsString()
  @IsIn(['ACTIVE', 'PAID', 'BLOCKED'])
  status: 'ACTIVE' | 'PAID' | 'BLOCKED';
}

class ImportCsvDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  csvContent: string;
}

@Controller('api/v1/partners')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  // List all partners (Admin / Owner)
  @Get()
  @Roles('ADMIN', 'OWNER')
  async listPartners() {
    return this.partnersService.listAllPartners();
  }

  // Create partner (Admin / Owner)
  @Post()
  @Roles('ADMIN', 'OWNER')
  async createPartner(@Body() body: any) {
    return this.partnersService.createPartner(body);
  }

  // Update status (Admin / Owner)
  @Put(':id/status')
  @Roles('ADMIN', 'OWNER')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.partnersService.updatePartnerStatus(id, status);
  }

  // Partner Cabinet: List devices of current partner
  @Get('cabinet/devices')
  @Roles('PARTNER', 'ADMIN', 'OWNER')
  async getCabinetDevices(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('partnerId') queryPartnerId?: string,
  ) {
    const partnerId = user.role === 'PARTNER' ? user.partnerId : (queryPartnerId || user.partnerId);
    if (!partnerId) {
      throw new ForbiddenException('Hamkor identifikatori aniqlanmadi');
    }
    return this.partnersService.getPartnerDevices(partnerId, search);
  }

  // Partner Cabinet: Add device
  @Post('cabinet/devices')
  @Roles('PARTNER', 'ADMIN', 'OWNER')
  async addCabinetDevice(
    @CurrentUser() user: any,
    @Body() body: AddDeviceDto,
    @Query('partnerId') queryPartnerId?: string,
  ) {
    const partnerId = user.role === 'PARTNER' ? user.partnerId : (queryPartnerId || user.partnerId);
    if (!partnerId) {
      throw new ForbiddenException('Hamkor identifikatori aniqlanmadi');
    }
    return this.partnersService.addOrUpdateDevice(partnerId, body.imei, body.status, 'CABINET');
  }

  // Partner Cabinet: Delete device
  @Delete('cabinet/devices/:id')
  @Roles('PARTNER', 'ADMIN', 'OWNER')
  async deleteCabinetDevice(
    @CurrentUser() user: any,
    @Param('id') deviceId: string,
    @Query('partnerId') queryPartnerId?: string,
  ) {
    const partnerId = user.role === 'PARTNER' ? user.partnerId : (queryPartnerId || user.partnerId);
    return this.partnersService.deleteDevice(partnerId, deviceId);
  }

  // Partner Cabinet: Import CSV
  @Post('cabinet/import-csv')
  @Roles('PARTNER', 'ADMIN', 'OWNER')
  async importCsv(
    @CurrentUser() user: any,
    @Body() body: ImportCsvDto,
    @Query('partnerId') queryPartnerId?: string,
  ) {
    const partnerId = user.role === 'PARTNER' ? user.partnerId : (queryPartnerId || user.partnerId);
    if (!partnerId) {
      throw new ForbiddenException('Hamkor identifikatori aniqlanmadi');
    }
    return this.partnersService.importCsv(partnerId, body.fileName, body.csvContent);
  }

  // Partner Cabinet: Import Batches
  @Get('cabinet/import-batches')
  @Roles('PARTNER', 'ADMIN', 'OWNER')
  async getImportBatches(@CurrentUser() user: any, @Query('partnerId') queryPartnerId?: string) {
    const partnerId = user.role === 'PARTNER' ? user.partnerId : (queryPartnerId || user.partnerId);
    return this.partnersService.getPartnerImportBatches(partnerId);
  }
}
