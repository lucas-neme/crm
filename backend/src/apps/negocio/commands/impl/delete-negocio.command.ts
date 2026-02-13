import { BaseCommand } from '@/common/base/base.command';

export class DeleteNegocioCommand extends BaseCommand {
  constructor(public readonly id: string) {
    super({ id });
  }
}
