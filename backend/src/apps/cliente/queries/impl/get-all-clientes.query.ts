import { BaseQuery } from '@/common/base/base.query';

export class GetAllClientesQuery extends BaseQuery {
  constructor(public readonly tenantId: string) {
    super({ tenantId });
  }
}
