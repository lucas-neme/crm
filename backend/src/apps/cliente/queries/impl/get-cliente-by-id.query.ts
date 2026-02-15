import { BaseQuery } from '@/common/base/base.query';

export class GetClienteByIdQuery extends BaseQuery {
  constructor(
    public readonly tenantId: string,
    public readonly id: string,
  ) {
    super({ tenantId, id });
  }
}
