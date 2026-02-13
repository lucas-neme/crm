import { BaseQuery } from '@/common/base/base.query';

export class GetNegocioByIdQuery extends BaseQuery {
  constructor(public readonly id: string) {
    super({ id });
  }
}
