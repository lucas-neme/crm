import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { I18nService } from 'nestjs-i18n';
import { NotFoundException } from '@nestjs/common';
import { UpdateProdutoCommand } from '../impl/update-produto.command';
import { Produto } from '../../models/produto.model';

@CommandHandler(UpdateProdutoCommand)
export class UpdateProdutoHandler implements ICommandHandler<UpdateProdutoCommand> {
  constructor(
    @InjectModel(Produto)
    private readonly produtoModel: typeof Produto,
    private readonly i18n: I18nService,
  ) {}

  async execute(command: UpdateProdutoCommand): Promise<Produto> {
    const { id, data } = command;

    const produto = await this.produtoModel.findByPk(id);

    if (!produto) {
      throw new NotFoundException(await this.i18n.translate('produto.notFound'));
    }

    await produto.update(data);

    return produto;
  }
}
