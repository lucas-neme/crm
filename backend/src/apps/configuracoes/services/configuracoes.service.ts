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
        const defaultTenant = String(process.env.DEFAULT_TENANT_ID || 'crm').trim().toLowerCase();
        const existingProdutoModulo = await this.configuracaoModel.findOne({ where: { tenantId: defaultTenant, chave: 'produto_modulo' } });
        if (!existingProdutoModulo) {
            await this.configuracaoModel.create({ tenantId: defaultTenant, chave: 'produto_modulo', valor: 'PADRAO' });
        }
        const existingEnabledModules = await this.configuracaoModel.findOne({ where: { tenantId: defaultTenant, chave: 'enabled_modules' } });
        if (!existingEnabledModules) {
            await this.configuracaoModel.create({
                tenantId: defaultTenant,
                chave: 'enabled_modules',
                valor: JSON.stringify({
                    leads: true,
                    produtos: true,
                    imoveis: true,
                    reservas: true,
                    negocios: true,
                    contasPagar: true,
                    contasReceber: true,
                }),
            });
        }
    }

    async getConfiguration(tenantId: string, key: string): Promise<string | null> {
        const config = await this.configuracaoModel.findOne({ where: { tenantId, chave: key } });
        return config ? config.valor : null;
    }

    async setConfiguration(tenantId: string, key: string, value: string): Promise<{ chave: string; valor: string }> {
        const existing = await this.configuracaoModel.findOne({ where: { tenantId, chave: key } });
        if (existing) {
            existing.valor = value;
            await existing.save();
        } else {
            await this.configuracaoModel.create({ tenantId, chave: key, valor: value });
        }
        return { chave: key, valor: value };
    }

    async getAll(tenantId: string): Promise<Configuracao[]> {
        return this.configuracaoModel.findAll({ where: { tenantId } });
    }
}
