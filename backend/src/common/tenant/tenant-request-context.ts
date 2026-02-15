import { AsyncLocalStorage } from 'node:async_hooks';

type TenantRequestContext = {
  tenantId: string;
  requestId: string;
};

const store = new AsyncLocalStorage<TenantRequestContext>();

export const tenantRequestContext = {
  run<T>(context: TenantRequestContext, callback: () => T): T {
    return store.run(context, callback);
  },
  get(): TenantRequestContext | undefined {
    return store.getStore();
  },
};

