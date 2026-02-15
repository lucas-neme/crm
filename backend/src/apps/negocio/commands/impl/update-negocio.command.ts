import { BaseCommand } from '@/common/base/base.command';
import { UpdateNegocioDto } from '../../dto/update-negocio.dto';

export class UpdateNegocioCommand extends BaseCommand {
  constructor(
    public readonly tenantId: string,
    public readonly id: string,
    public readonly data: UpdateNegocioDto,
  ) {
    super({ tenantId, id, data });
  }
}
