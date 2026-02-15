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
        const existingProdutoModulo = await this.configuracaoModel.findOne({ where: { chave: 'default:produto_modulo' } });
        if (!existingProdutoModulo) {
            await this.configuracaoModel.create({ chave: 'default:produto_modulo', valor: 'PADRAO' });
        }
        const existingEnabledModules = await this.configuracaoModel.findOne({ where: { chave: 'default:enabled_modules' } });
        if (!existingEnabledModules) {
            await this.configuracaoModel.create({
                chave: 'default:enabled_modules',
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

    private toTenantKey(tenantId: string, key: string): string {
        return `${tenantId}:${key}`;
    }

    async getConfiguration(tenantId: string, key: string): Promise<string | null> {
        const config = await this.configuracaoModel.findByPk(this.toTenantKey(tenantId, key));
        if (config) return config.valor;

        const legacy = await this.configuracaoModel.findByPk(key);
        return legacy ? legacy.valor : null;
    }

    async setConfiguration(tenantId: string, key: string, value: string): Promise<{ chave: string; valor: string }> {
        const tenantKey = this.toTenantKey(tenantId, key);
        await this.configuracaoModel.upsert({ chave: tenantKey, valor: value });
        return { chave: key, valor: value };
    }

    async getAll(tenantId: string): Promise<Configuracao[]> {
        const rows = await this.configuracaoModel.findAll();
        const prefix = `${tenantId}:`;
        return rows.filter((item) => item.chave.startsWith(prefix));
    }
}
