import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Configuracao } from './models/configuracao.model';
import { ConfiguracoesService } from './services/configuracoes.service';
import { ConfiguracoesController } from './controllers/configuracoes.controller';

@Module({
    imports: [SequelizeModule.forFeature([Configuracao])],
    controllers: [ConfiguracoesController],
    providers: [ConfiguracoesService],
    exports: [ConfiguracoesService],
})
export class ConfiguracoesModule { }
