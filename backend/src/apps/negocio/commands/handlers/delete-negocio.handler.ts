import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { I18nService } from 'nestjs-i18n';
import { NotFoundException } from '@nestjs/common';
import { DeleteNegocioCommand } from '../impl/delete-negocio.command';
import { Negocio } from '../../models/negocio.model';
import { NegocioProduto } from '../../models/negocio-produto.model';

@CommandHandler(DeleteNegocioCommand)
export class DeleteNegocioHandler implements ICommandHandler<DeleteNegocioCommand> {
  constructor(
    @InjectModel(Negocio)
    private readonly negocioModel: typeof Negocio,
    @InjectModel(NegocioProduto)
    private readonly negocioProdutoModel: typeof NegocioProduto,
    private readonly i18n: I18nService,
  ) {}

  async execute(command: DeleteNegocioCommand): Promise<boolean> {
    const { tenantId, id } = command;

    const negocio = await this.negocioModel.findOne({ where: { id, tenantId } });

    if (!negocio) {
      throw new NotFoundException(await this.i18n.translate('negocio.notFound'));
    }

    // Remover associações com produtos
    await this.negocioProdutoModel.destroy({
      where: { negocioId: id, tenantId },
    });

    await negocio.destroy();

    return true;
  }
}
