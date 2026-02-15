import { BaseQuery } from '@/common/base/base.query';

export class GetProdutoByIdQuery extends BaseQuery {
  constructor(
    public readonly tenantId: string,
    public readonly id: string,
  ) {
    super({ tenantId, id });
  }
}
