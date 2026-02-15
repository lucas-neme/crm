import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const TENANT_REGEX = /^[a-z0-9][a-z0-9-]{0,62}$/i;

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: Request & { tenantId?: string }, _res: Response, next: NextFunction) {
    const headerTenant = this.normalizeTenant(req.header('x-tenant-id'));
    const subdomainTenant = this.extractSubdomainTenant(req.headers.host);

    if (headerTenant && subdomainTenant && headerTenant !== subdomainTenant) {
      throw new BadRequestException('Tenant conflict between host and x-tenant-id');
    }

    const tenantId = subdomainTenant || headerTenant;
    if (!tenantId) {
      throw new BadRequestException('Tenant could not be resolved from host or x-tenant-id');
    }

    req.tenantId = tenantId.toLowerCase();
    next();
  }

  private extractSubdomainTenant(host?: string): string | null {
    if (!host) return null;
    const cleanHost = host.split(':')[0].trim().toLowerCase();
    if (!cleanHost || cleanHost === 'localhost' || cleanHost.endsWith('.localhost')) return null;
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(cleanHost)) return null;

    const parts = cleanHost.split('.');
    if (parts.length < 3) return null;

    return this.normalizeTenant(parts[0]);
  }

  private normalizeTenant(value?: string | null): string | null {
    const normalized = (value || '').trim().toLowerCase();
    if (!normalized) return null;
    if (!TENANT_REGEX.test(normalized)) return null;
    return normalized;
  }
}
