import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SequelizeModule } from '@nestjs/sequelize';
import { NegociosController } from './negocios.controller';
import { Negocio } from './models/negocio.model';
import { NegocioProduto } from './models/negocio-produto.model';
import { Endereco } from '@/common/models/endereco.model';
import { Produto } from '@/apps/produto/models/produto.model';
import { Unidade } from '@/apps/produto-imobiliaria/models/unidade.model';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';
import { FinanceiroModule } from '@/apps/financeiro/financeiro.module';

@Module({
  imports: [
    CqrsModule,
    SequelizeModule.forFeature([Negocio, NegocioProduto, Endereco, Produto, Unidade]),
    FinanceiroModule,
  ],
  controllers: [NegociosController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class NegociosModule { }
