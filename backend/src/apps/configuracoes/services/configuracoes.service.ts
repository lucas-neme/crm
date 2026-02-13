import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Configuracao } from '../models/configuracao.model';

@Injectable()
export class ConfiguracoesService implements OnModuleInit {
    constructor(
        @InjectModel(Configuracao)
        private readonly configuracaoModel: typeof Configuracao,
    ) { }

    async onModuleInit() {
        // Inicializar configuração padrão se não existir
        const existing = await this.configuracaoModel.findOne({ where: { chave: 'produto_modulo' } });
        if (!existing) {
            await this.configuracaoModel.create({ chave: 'produto_modulo', valor: 'PADRAO' });
        }
    }

    async getConfiguration(key: string): Promise<string | null> {
        const config = await this.configuracaoModel.findByPk(key);
        return config ? config.valor : null;
    }

    async setConfiguration(key: string, value: string): Promise<{ chave: string; valor: string }> {
        await this.configuracaoModel.upsert({ chave: key, valor: value });
        return { chave: key, valor: value };
    }

    async getAll(): Promise<Configuracao[]> {
        return this.configuracaoModel.findAll();
    }
}
