import { BaseCommand } from '@/common/base/base.command';
import { CreateNegocioDto } from '../../dto/create-negocio.dto';

export class CreateNegocioCommand extends BaseCommand {
  constructor(
    public readonly tenantId: string,
    public readonly data: CreateNegocioDto,
  ) {
    super({ tenantId, data });
  }
}
