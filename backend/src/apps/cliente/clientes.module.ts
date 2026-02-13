import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClientesController } from './clientes.controller';
import { Cliente } from './models/cliente.model';
import { Documento } from './models/documento.model';
import { Endereco } from '@/common/models/endereco.model';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [CqrsModule, SequelizeModule.forFeature([Cliente, Documento, Endereco])],
  controllers: [ClientesController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class ClientesModule {}
