import { BaseCommand } from '@/common/base/base.command';
import { CreateClienteDto } from '../../dto/create-cliente.dto';

export class CreateClienteCommand extends BaseCommand {
  constructor(public readonly data: CreateClienteDto) {
    super(data);
  }
}
