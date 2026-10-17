import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    userId?: string | null;
    action: string;
    entite: string;
    entiteId?: string;
    avant?: any;
    apres?: any;
    ip?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entite: params.entite,
        entiteId: params.entiteId ?? '',
        avant: params.avant ?? undefined,
        apres: params.apres ?? undefined,
        ip: params.ip ?? null,
        userAgent: params.userAgent ?? null,
      },
    });
  }
}