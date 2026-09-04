import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@tekshir/shared';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(params: {
    actorType: 'USER' | 'ADMIN' | 'OWNER' | 'PARTNER' | 'SYSTEM';
    actorId?: string;
    action: AuditAction | string;
    targetType?: string;
    targetId?: string;
    oldValue?: any;
    newValue?: any;
    ip?: string;
    requestId?: string;
  }) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          actorType: params.actorType,
          actorId: params.actorId,
          action: params.action,
          targetType: params.targetType,
          targetId: params.targetId,
          oldValue: params.oldValue ? JSON.stringify(params.oldValue) : undefined,
          newValue: params.newValue ? JSON.stringify(params.newValue) : undefined,
          ip: params.ip,
          requestId: params.requestId,
        },
      });
    } catch (e) {
      console.error('[AUDIT LOG ERROR]', e);
    }
  }
}
