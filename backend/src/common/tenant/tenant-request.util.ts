import { BadRequestException } from '@nestjs/common';

export function getTenantId(req: any): string {
  const tenantId = String(req?.tenantId || req?.user?.tenantId || '').trim().toLowerCase();
  if (!tenantId) {
    throw new BadRequestException('Tenant context is required');
  }
  return tenantId;
}
