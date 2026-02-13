import { BaseCommand } from '@/common/base/base.command';
import { CreateProdutoDto } from '../../dto/create-produto.dto';

export class CreateProdutoCommand extends BaseCommand {
  constructor(public readonly data: CreateProdutoDto) {
    super(data);
  }
}
