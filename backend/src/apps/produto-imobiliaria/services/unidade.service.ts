import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Unidade } from '../models/unidade.model';
import { Empreendimento } from '../models/empreendimento.model';
import { Op } from 'sequelize';

@Injectable()
export class UnidadeService {
    constructor(
        @InjectModel(Unidade)
        private readonly unidadeModel: typeof Unidade,
        @InjectModel(Empreendimento)
        private readonly empreendimentoModel: typeof Empreendimento,
    ) { }

    async create(tenantId: string, data: Partial<Unidade>): Promise<Unidade> {
        const empreendimento = await this.empreendimentoModel.findOne({ where: { id: data.empreendimentoId, tenantId } });
        if (!empreendimento) throw new BadRequestException('Empreendimento nao encontrado');

        const exists = await this.unidadeModel.findOne({ where: { codigoInterno: data.codigoInterno, tenantId } });
        if (exists) throw new BadRequestException('Codigo interno ja existe');

        return this.unidadeModel.create({ ...data, tenantId });
    }

    async findAll(tenantId: string, query: any = {}): Promise<Unidade[]> {
        const where: any = { tenantId };
        if (query.empreendimentoId) where.empreendimentoId = query.empreendimentoId;
        if (query.statusUnidade) where.statusUnidade = query.statusUnidade;
        if (query.tipo) where.tipo = query.tipo;
        if (query.precoMin && query.precoMax) {
            where.valorOferta = { [Op.between]: [query.precoMin, query.precoMax] };
        }

        return this.unidadeModel.findAll({
            where,
            order: [['codigoInterno', 'ASC']],
            include: [{ model: Empreendimento, attributes: ['id', 'nome'], where: { tenantId }, required: false }]
        });
    }

    async findOne(tenantId: string, id: string): Promise<Unidade> {
        return this.unidadeModel.findOne({ where: { id, tenantId }, include: [{ model: Empreendimento, where: { tenantId }, required: false }] });
    }

    async update(tenantId: string, id: string, data: Partial<Unidade>): Promise<Unidade> {
        const unidade = await this.unidadeModel.findOne({ where: { id, tenantId } });
        if (!unidade) throw new Error('Unidade nao encontrada');

        await unidade.update(data);
        return this.findOne(tenantId, id);
    }

    async updateStatus(tenantId: string, id: string, status: string): Promise<Unidade> {
        const unidade = await this.unidadeModel.findOne({ where: { id, tenantId } });
        if (!unidade) throw new Error('Unidade nao encontrada');

        if (['RESERVADO', 'VENDIDO'].includes(unidade.statusUnidade) && status === 'DISPONIVEL') {
            // reserved for future state validation rules
        }

        await unidade.update({ statusUnidade: status });
        return unidade;
    }

    async remove(tenantId: string, id: string): Promise<void> {
        const unidade = await this.unidadeModel.findOne({ where: { id, tenantId } });
        if (unidade) await unidade.destroy();
    }
}
