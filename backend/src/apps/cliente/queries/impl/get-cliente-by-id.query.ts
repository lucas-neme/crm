import { BaseQuery } from '@/common/base/base.query';

export class GetClienteByIdQuery extends BaseQuery {
  constructor(public readonly id: string) {
    super({ id });
  }
}
