import { BaseCommand } from '@/common/base/base.command';

export class DeleteProdutoCommand extends BaseCommand {
  constructor(public readonly id: string) {
    super({ id });
  }
}
