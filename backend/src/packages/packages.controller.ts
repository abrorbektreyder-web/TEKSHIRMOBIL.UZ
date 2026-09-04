import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/v1/packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  async getActivePackages() {
    return this.packagesService.getActivePackages();
  }

  @Get(':id')
  async getPackage(@Param('id') id: string) {
    return this.packagesService.getPackageById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  async createPackage(@Body() body: any) {
    return this.packagesService.createPackage(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  async updatePackage(@Param('id') id: string, @Body() body: any) {
    return this.packagesService.updatePackage(id, body);
  }
}
