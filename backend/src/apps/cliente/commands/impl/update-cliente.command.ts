import { BaseCommand } from '@/common/base/base.command';
import { UpdateClienteDto } from '../../dto/update-cliente.dto';

export class UpdateClienteCommand extends BaseCommand {
  constructor(
    public readonly id: string,
    public readonly data: UpdateClienteDto,
  ) {
    super({ id, data });
  }
}
