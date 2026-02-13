import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProdutosController } from './produtos.controller';
import { Produto } from './models/produto.model';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [CqrsModule, SequelizeModule.forFeature([Produto])],
  controllers: [ProdutosController],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [SequelizeModule],
})
export class ProdutosModule {}
