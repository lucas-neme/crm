import { BaseQuery } from '@/common/base/base.query';

export class GetAllProdutosQuery extends BaseQuery {
  constructor(public readonly tenantId: string) {
    super({ tenantId });
  }
}
