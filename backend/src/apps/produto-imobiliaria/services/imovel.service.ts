import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Imovel } from '../models/imovel.model';

@Injectable()
export class ImovelService {
    constructor(
        @InjectModel(Imovel)
        private readonly imovelModel: typeof Imovel,
    ) { }

    async findAll(tenantId: string) {
        return this.imovelModel.findAll({ where: { tenantId }, order: [['createdAt', 'DESC']] });
    }

    async create(tenantId: string, data: Partial<Imovel>) {
        return this.imovelModel.create({ ...data, tenantId });
    }

    async findOne(tenantId: string, id: string) {
        return this.imovelModel.findOne({ where: { id, tenantId } });
    }

    async update(tenantId: string, id: string, data: Partial<Imovel>) {
        const imovel = await this.imovelModel.findOne({ where: { id, tenantId } });
        if (!imovel) return null;
        return imovel.update(data);
    }

    async remove(tenantId: string, id: string) {
        const imovel = await this.imovelModel.findOne({ where: { id, tenantId } });
        if (imovel) {
            await imovel.destroy();
        }
    }
}
