import { BaseCommand } from '@/common/base/base.command';
import { CreateProdutoDto } from '../../dto/create-produto.dto';

export class CreateProdutoCommand extends BaseCommand {
  constructor(
    public readonly tenantId: string,
    public readonly data: CreateProdutoDto,
  ) {
    super({ tenantId, data });
  }
}
