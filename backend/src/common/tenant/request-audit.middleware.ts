import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';

export function requestAuditMiddleware(req: Request & { tenantId?: string; user?: any }, res: Response, next: NextFunction): void {
  const enabled = String(process.env.AUDIT_REQUEST_LOG || 'true').toLowerCase() !== 'false';
  if (!enabled) {
    next();
    return;
  }

  const startedAt = Date.now();
  const requestId = req.header('x-request-id') || randomUUID();

  res.on('finish', () => {
    const elapsedMs = Date.now() - startedAt;
    const payload = {
      ts: new Date().toISOString(),
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs: elapsedMs,
      tenantId: String(req.tenantId || '').trim().toLowerCase() || null,
      userId: req.user?.id || null,
      ip: req.ip,
    };
    console.log(`[AUDIT] ${JSON.stringify(payload)}`);
  });

  next();
}

