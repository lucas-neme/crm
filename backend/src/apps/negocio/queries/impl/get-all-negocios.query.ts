import { BaseQuery } from '@/common/base/base.query';

export class GetAllNegociosQuery extends BaseQuery {
  constructor(public readonly tenantId: string) {
    super({ tenantId });
  }
}
