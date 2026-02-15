import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Proposta } from '../models/proposta.model';
import { Unidade } from '../models/unidade.model';
import { Cliente } from '../../cliente/models/cliente.model';

@Injectable()
export class PropostaService {
    constructor(
        @InjectModel(Proposta)
        private readonly propostaModel: typeof Proposta,
    ) { }

    async create(tenantId: string, data: Partial<Proposta>): Promise<Proposta> {
        if (!data.clienteId || !data.unidadeId || !data.valorProposto) {
            throw new BadRequestException('Dados incompletos');
        }
        return this.propostaModel.create({ ...data, tenantId });
    }

    async findAll(tenantId: string, query: any = {}): Promise<Proposta[]> {
        const where: any = { tenantId };
        if (query.unidadeId) where.unidadeId = query.unidadeId;
        if (query.clienteId) where.clienteId = query.clienteId;
        if (query.status) where.status = query.status;

        return this.propostaModel.findAll({
            where,
            include: [
                { model: Unidade, attributes: ['id', 'codigoInterno', 'valorOferta'], where: { tenantId }, required: false },
                { model: Cliente, attributes: ['id', 'nome'], where: { tenantId }, required: false }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    async findOne(tenantId: string, id: string): Promise<Proposta> {
        return this.propostaModel.findOne({
            where: { id, tenantId },
            include: [
                { model: Unidade, where: { tenantId }, required: false },
                { model: Cliente, where: { tenantId }, required: false },
            ]
        });
    }

    async update(tenantId: string, id: string, data: Partial<Proposta>): Promise<Proposta> {
        const proposta = await this.propostaModel.findOne({ where: { id, tenantId } });
        if (!proposta) throw new BadRequestException('Proposta nao encontrada');
        return proposta.update(data);
    }
}
