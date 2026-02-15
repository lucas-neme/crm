import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { I18nService } from 'nestjs-i18n';
import { NotFoundException } from '@nestjs/common';
import { DeleteProdutoCommand } from '../impl/delete-produto.command';
import { Produto } from '../../models/produto.model';

@CommandHandler(DeleteProdutoCommand)
export class DeleteProdutoHandler implements ICommandHandler<DeleteProdutoCommand> {
  constructor(
    @InjectModel(Produto)
    private readonly produtoModel: typeof Produto,
    private readonly i18n: I18nService,
  ) {}

  async execute(command: DeleteProdutoCommand): Promise<boolean> {
    const { tenantId, id } = command;

    const produto = await this.produtoModel.findOne({ where: { id, tenantId } });

    if (!produto) {
      throw new NotFoundException(await this.i18n.translate('produto.notFound'));
    }

    await produto.destroy();

    return true;
  }
}
