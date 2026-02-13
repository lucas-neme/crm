import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { GetAllProdutosQuery } from '../impl/get-all-produtos.query';
import { Produto } from '../../models/produto.model';

@QueryHandler(GetAllProdutosQuery)
export class GetAllProdutosHandler implements IQueryHandler<GetAllProdutosQuery> {
  constructor(
    @InjectModel(Produto)
    private readonly produtoModel: typeof Produto,
  ) {}

  async execute(query: GetAllProdutosQuery): Promise<Produto[]> {
    return await this.produtoModel.findAll();
  }
}
