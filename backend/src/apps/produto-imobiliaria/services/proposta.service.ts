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

    async create(data: Partial<Proposta>): Promise<Proposta> {
        // Basic validation
        // Status initialization?
        if (!data.clienteId || !data.unidadeId || !data.valorProposto) {
            throw new BadRequestException('Dados incompletos');
        }
        return this.propostaModel.create(data);
    }

    async findAll(query: any = {}): Promise<Proposta[]> {
        const where: any = {};
        if (query.unidadeId) where.unidadeId = query.unidadeId;
        if (query.clienteId) where.clienteId = query.clienteId;
        if (query.status) where.status = query.status;

        return this.propostaModel.findAll({
            where,
            include: [
                { model: Unidade, attributes: ['id', 'codigoInterno', 'valorOferta'] },
                { model: Cliente, attributes: ['id', 'nome'] }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    async findOne(id: string): Promise<Proposta> {
        return this.propostaModel.findByPk(id, {
            include: [Unidade, Cliente]
        });
    }

    async update(id: string, data: Partial<Proposta>): Promise<Proposta> {
        const proposta = await this.propostaModel.findByPk(id);
        if (!proposta) throw new BadRequestException('Proposta não encontrada');
        return proposta.update(data);
    }
}
