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

    async create(data: Partial<Unidade>): Promise<Unidade> {
        const empreendimento = await this.empreendimentoModel.findByPk(data.empreendimentoId);
        if (!empreendimento) throw new BadRequestException('Empreendimento não encontrado');

        const exists = await this.unidadeModel.findOne({ where: { codigoInterno: data.codigoInterno } });
        if (exists) throw new BadRequestException('Código interno já existe');

        return this.unidadeModel.create(data);
    }

    async findAll(query: any = {}): Promise<Unidade[]> {
        const where: any = {};
        if (query.empreendimentoId) where.empreendimentoId = query.empreendimentoId;
        if (query.statusUnidade) where.statusUnidade = query.statusUnidade;
        if (query.tipo) where.tipo = query.tipo;
        if (query.precoMin && query.precoMax) {
            where.valorOferta = { [Op.between]: [query.precoMin, query.precoMax] };
        }

        return this.unidadeModel.findAll({
            where,
            order: [['codigoInterno', 'ASC']],
            include: [{ model: Empreendimento, attributes: ['id', 'nome'] }]
        });
    }

    async findOne(id: string): Promise<Unidade> {
        return this.unidadeModel.findByPk(id, { include: [Empreendimento] });
    }

    async update(id: string, data: Partial<Unidade>): Promise<Unidade> {
        const unidade = await this.unidadeModel.findByPk(id);
        if (!unidade) throw new Error('Unidade não encontrada');

        // Check Status Transition Logic here if needed
        // e.g. Can't move from Vendido to Disponivel without extra checks? 
        // For now simplistic.

        await unidade.update(data);
        return this.findOne(id);
    }

    async updateStatus(id: string, status: string): Promise<Unidade> {
        const unidade = await this.unidadeModel.findByPk(id);
        if (!unidade) throw new Error('Unidade não encontrada');

        // Basic validation
        if (['RESERVADO', 'VENDIDO'].includes(unidade.statusUnidade) && status === 'DISPONIVEL') {
            // Check if there are active reservations?
            // Implementing simplistic logic for now
        }

        await unidade.update({ statusUnidade: status });
        return unidade;
    }

    async remove(id: string): Promise<void> {
        const unidade = await this.unidadeModel.findByPk(id);
        if (unidade) await unidade.destroy();
    }
}
