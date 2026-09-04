import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'OWNER')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardKpis();
  }

  @Get('users')
  async listUsers(@Query('search') search?: string) {
    return this.adminService.listUsers(search);
  }

  @Put('users/:id/status')
  async updateUserStatus(
    @Param('id') userId: string,
    @Body('status') status: 'ACTIVE' | 'BLOCKED',
  ) {
    return this.adminService.updateUserStatus(userId, status);
  }

  @Get('verifications')
  async listVerifications(@Query('limit') limit?: string) {
    return this.adminService.listVerifications(limit ? parseInt(limit, 10) : 50);
  }

  @Get('payments')
  async listPayments(@Query('limit') limit?: string) {
    return this.adminService.listPayments(limit ? parseInt(limit, 10) : 50);
  }

  @Get('audit-logs')
  async listAuditLogs(@Query('limit') limit?: string) {
    return this.adminService.listAuditLogs(limit ? parseInt(limit, 10) : 50);
  }
}
