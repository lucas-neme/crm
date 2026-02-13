import { BaseCommand } from '@/common/base/base.command';
import { UpdateNegocioDto } from '../../dto/update-negocio.dto';

export class UpdateNegocioCommand extends BaseCommand {
  constructor(
    public readonly id: string,
    public readonly data: UpdateNegocioDto,
  ) {
    super({ id, data });
  }
}
