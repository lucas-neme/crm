import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Imovel } from './models/imovel.model';
import { ImovelService } from './services/imovel.service';
import { ImovelController } from './controllers/imovel.controller';

import { Empreendimento } from './models/empreendimento.model';
import { Unidade } from './models/unidade.model';
import { Reserva } from './models/reserva.model';
import { Proposta } from './models/proposta.model';
import { Cliente } from '../cliente/models/cliente.model';

import { EmpreendimentoService } from './services/empreendimento.service';
import { UnidadeService } from './services/unidade.service';
import { ReservaService } from './services/reserva.service';
import { PropostaService } from './services/proposta.service';

import { EmpreendimentoController } from './controllers/empreendimento.controller';
import { UnidadeController } from './controllers/unidade.controller';
import { ReservaController } from './controllers/reserva.controller';
import { PropostaController } from './controllers/proposta.controller';

@Module({
    imports: [SequelizeModule.forFeature([
        Imovel,
        Empreendimento,
        Unidade,
        Reserva,
        Proposta,
        Cliente
    ])],
    controllers: [
        ImovelController,
        EmpreendimentoController,
        UnidadeController,
        ReservaController,
        PropostaController
    ],
    providers: [
        ImovelService,
        EmpreendimentoService,
        UnidadeService,
        ReservaService,
        PropostaService
    ],
})
export class ImovelModule { }
