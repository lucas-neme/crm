import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Empreendimento } from '../models/empreendimento.model';
import { Unidade } from '../models/unidade.model';

@Injectable()
export class EmpreendimentoService {
    constructor(
        @InjectModel(Empreendimento)
        private readonly empreendimentoModel: typeof Empreendimento,
    ) { }

    async create(tenantId: string, data: Partial<Empreendimento>): Promise<Empreendimento> {
        return this.empreendimentoModel.create({ ...data, tenantId });
    }

    async findAll(tenantId: string): Promise<Empreendimento[]> {
        return this.empreendimentoModel.findAll({
            where: { tenantId },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Unidade,
                    attributes: ['id', 'statusUnidade'],
                    where: { tenantId },
                    required: false,
                }
            ]
        });
    }

    async findOne(tenantId: string, id: string): Promise<Empreendimento> {
        return this.empreendimentoModel.findOne({
            where: { id, tenantId },
            include: [{ model: Unidade, where: { tenantId }, required: false }],
        });
    }

    async update(tenantId: string, id: string, data: Partial<Empreendimento>): Promise<Empreendimento> {
        const empreendimento = await this.empreendimentoModel.findOne({ where: { id, tenantId } });
        if (!empreendimento) throw new Error('Empreendimento nao encontrado');
        const { tenantId: _tenantId, tenant_id: _tenantIdSnake, ...safeData } = (data || {}) as any;
        return empreendimento.update(safeData);
    }

    async remove(tenantId: string, id: string): Promise<void> {
        const empreendimento = await this.empreendimentoModel.findOne({ where: { id, tenantId } });
        if (empreendimento) {
            await empreendimento.destroy();
        }
    }
}
