import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { I18nService } from 'nestjs-i18n';
import { CreateProdutoCommand } from '../impl/create-produto.command';
import { Produto } from '../../models/produto.model';

@CommandHandler(CreateProdutoCommand)
export class CreateProdutoHandler implements ICommandHandler<CreateProdutoCommand> {
  constructor(
    @InjectModel(Produto)
    private readonly produtoModel: typeof Produto,
    private readonly i18n: I18nService,
  ) {}

  async execute(command: CreateProdutoCommand): Promise<Produto> {
    const { tenantId, data } = command;

    const ultimoProduto = await this.produtoModel.findOne({
      where: { tenantId },
      order: [['codigo', 'DESC']],
      raw: true,
    });
    const novoCodigo = ultimoProduto && ultimoProduto.codigo ? ultimoProduto.codigo + 1 : 1;

    const produto = await this.produtoModel.create({
      codigo: novoCodigo,
      tenantId,
      nome: data.nome,
      quantidade: data.quantidade,
      valorUnitario: data.valorUnitario,
    });

    return produto;
  }
}
