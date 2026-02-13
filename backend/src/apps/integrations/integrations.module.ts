import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { IntegrationsController } from './integrations.controller';
import { Cliente } from '../cliente/models/cliente.model';
import { Negocio } from '../negocio/models/negocio.model';
import { Produto } from '../produto/models/produto.model';
import { NegocioProduto } from '../negocio/models/negocio-produto.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Cliente, Negocio, Produto, NegocioProduto]),
  ],
  controllers: [IntegrationsController],
})
export class IntegrationsModule {}
