import { Sequelize } from 'sequelize-typescript';
import { tenantRequestContext } from './tenant-request-context';

function escapeLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function resolveTenantForSession(): string {
  const contextTenantId = tenantRequestContext.get()?.tenantId;
  const fallbackTenantId = String(process.env.DEFAULT_TENANT_ID || '').trim().toLowerCase();
  return String(contextTenantId || fallbackTenantId).trim().toLowerCase();
}

async function applyTenantSession(connection: any): Promise<void> {
  const tenantId = resolveTenantForSession();
  if (!tenantId || typeof connection?.query !== 'function') {
    return;
  }

  const sql = `SELECT set_config('app.tenant_id', '${escapeLiteral(tenantId)}', false);`;
  await connection.query(sql);
}

export function buildSequelizeTenantHooks() {
  return {
    afterConnect: async (connection: any) => {
      await applyTenantSession(connection);
    },
    afterPoolAcquire: async (connection: any) => {
      await applyTenantSession(connection);
    },
    beforeQuery: async (_options: unknown, query: any) => {
      await applyTenantSession(query?.connection);
    },
  };
}

export function registerTenantDbHooks(sequelize: Sequelize): void {
  const hooks = buildSequelizeTenantHooks();
  sequelize.addHook('afterConnect', hooks.afterConnect);
  sequelize.addHook('afterPoolAcquire', hooks.afterPoolAcquire);
  sequelize.addHook('beforeQuery', hooks.beforeQuery);
}

