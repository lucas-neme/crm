import { BaseCommand } from '@/common/base/base.command';

export class DeleteNegocioCommand extends BaseCommand {
  constructor(
    public readonly tenantId: string,
    public readonly id: string,
  ) {
    super({ tenantId, id });
  }
}
