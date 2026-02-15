import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { I18nService } from 'nestjs-i18n';
import { NotFoundException } from '@nestjs/common';
import { DeleteClienteCommand } from '../impl/delete-cliente.command';
import { Cliente } from '../../models/cliente.model';

@CommandHandler(DeleteClienteCommand)
export class DeleteClienteHandler implements ICommandHandler<DeleteClienteCommand> {
  constructor(
    @InjectModel(Cliente)
    private readonly clienteModel: typeof Cliente,
    private readonly i18n: I18nService,
  ) {}

  async execute(command: DeleteClienteCommand): Promise<boolean> {
    const { tenantId, id } = command;

    const cliente = await this.clienteModel.findOne({ where: { id, tenantId } });

    if (!cliente) {
      throw new NotFoundException(await this.i18n.translate('cliente.notFound'));
    }

    await cliente.destroy();

    return true;
  }
}
