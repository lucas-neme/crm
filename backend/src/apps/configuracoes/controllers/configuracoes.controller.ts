import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ConfiguracoesService } from '../services/configuracoes.service';

@Controller('configuracoes')
export class ConfiguracoesController {
    constructor(private readonly configService: ConfiguracoesService) { }

    @Get()
    async getAll() {
        return this.configService.getAll();
    }

    @Get(':chave')
    async get(@Param('chave') chave: string) {
        const valor = await this.configService.getConfiguration(chave);
        return { chave, valor };
    }

    @Post(':chave')
    async set(@Param('chave') chave: string, @Body('valor') valor: string) {
        return this.configService.setConfiguration(chave, valor);
    }
}
