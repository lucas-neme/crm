import { BaseCommand } from '@/common/base/base.command';

export class DeleteProdutoCommand extends BaseCommand {
  constructor(
    public readonly tenantId: string,
    public readonly id: string,
  ) {
    super({ tenantId, id });
  }
}
