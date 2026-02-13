import { BaseCommand } from '@/common/base/base.command';
import { UpdateProdutoDto } from '../../dto/update-produto.dto';

export class UpdateProdutoCommand extends BaseCommand {
  constructor(
    public readonly id: string,
    public readonly data: UpdateProdutoDto,
  ) {
    super({ id, data });
  }
}
