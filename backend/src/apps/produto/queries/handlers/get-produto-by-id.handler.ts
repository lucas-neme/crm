import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { I18nService } from 'nestjs-i18n';
import { NotFoundException } from '@nestjs/common';
import { GetProdutoByIdQuery } from '../impl/get-produto-by-id.query';
import { Produto } from '../../models/produto.model';

@QueryHandler(GetProdutoByIdQuery)
export class GetProdutoByIdHandler implements IQueryHandler<GetProdutoByIdQuery> {
  constructor(
    @InjectModel(Produto)
    private readonly produtoModel: typeof Produto,
    private readonly i18n: I18nService,
  ) {}

  async execute(query: GetProdutoByIdQuery): Promise<Produto> {
    const { tenantId, id } = query;

    const produto = await this.produtoModel.findOne({ where: { id, tenantId } });

    if (!produto) {
      throw new NotFoundException(await this.i18n.translate('produto.notFound'));
    }

    return produto;
  }
}
