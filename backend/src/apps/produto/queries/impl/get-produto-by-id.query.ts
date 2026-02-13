import { BaseQuery } from '@/common/base/base.query';

export class GetProdutoByIdQuery extends BaseQuery {
  constructor(public readonly id: string) {
    super({ id });
  }
}
