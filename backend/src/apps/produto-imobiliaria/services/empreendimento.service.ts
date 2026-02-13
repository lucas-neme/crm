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

    async create(data: Partial<Empreendimento>): Promise<Empreendimento> {
        return this.empreendimentoModel.create(data);
    }

    async findAll(): Promise<Empreendimento[]> {
        return this.empreendimentoModel.findAll({
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Unidade,
                    attributes: ['id', 'statusUnidade'],
                }
            ]
        });
    }

    async findOne(id: string): Promise<Empreendimento> {
        return this.empreendimentoModel.findByPk(id, {
            include: [Unidade],
        });
    }

    async update(id: string, data: Partial<Empreendimento>): Promise<Empreendimento> {
        const empreendimento = await this.empreendimentoModel.findByPk(id);
        if (!empreendimento) throw new Error('Empreendimento não encontrado');
        return empreendimento.update(data);
    }

    async remove(id: string): Promise<void> {
        const empreendimento = await this.empreendimentoModel.findByPk(id);
        if (empreendimento) {
            await empreendimento.destroy();
        }
    }
}
