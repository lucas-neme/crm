import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Imovel } from '../models/imovel.model';

@Injectable()
export class ImovelService {
    constructor(
        @InjectModel(Imovel)
        private readonly imovelModel: typeof Imovel,
    ) { }

    async findAll() {
        return this.imovelModel.findAll({ order: [['createdAt', 'DESC']] });
    }

    async create(data: Partial<Imovel>) {
        return this.imovelModel.create(data);
    }

    async findOne(id: string) {
        return this.imovelModel.findByPk(id);
    }

    async update(id: string, data: Partial<Imovel>) {
        const imovel = await this.imovelModel.findByPk(id);
        if (!imovel) return null;
        return imovel.update(data);
    }

    async remove(id: string) {
        const imovel = await this.imovelModel.findByPk(id);
        if (imovel) {
            await imovel.destroy();
        }
    }
}
