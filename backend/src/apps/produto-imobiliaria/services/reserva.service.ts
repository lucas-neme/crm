import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Reserva } from '../models/reserva.model';
import { Unidade } from '../models/unidade.model';
import { Cliente } from '../../cliente/models/cliente.model';

@Injectable()
export class ReservaService {
    constructor(
        @InjectModel(Reserva)
        private readonly reservaModel: typeof Reserva,
        @InjectModel(Unidade)
        private readonly unidadeModel: typeof Unidade,
    ) { }

    async create(tenantId: string, data: Partial<Reserva>): Promise<Reserva> {
        await this.verifyExpiredReservations(tenantId);
        const unidade = await this.unidadeModel.findOne({ where: { id: data.unidadeId, tenantId } });
        if (!unidade) throw new BadRequestException('Unidade nao encontrada');

        if (unidade.statusUnidade !== 'DISPONIVEL') {
            throw new BadRequestException('Unidade nao esta disponivel para reserva');
        }

        const activeReserva = await this.reservaModel.findOne({
            where: {
                unidadeId: data.unidadeId,
                tenantId,
                status: 'ATIVA',
            }
        });

        if (activeReserva) {
            throw new BadRequestException('Ja existe uma reserva ativa para esta unidade');
        }

        const reserva = await this.reservaModel.create({ ...data, tenantId });
        await unidade.update({ statusUnidade: 'RESERVADO' });

        return reserva;
    }

    async findAll(tenantId: string, query: any = {}): Promise<Reserva[]> {
        await this.verifyExpiredReservations(tenantId);

        const where: any = { tenantId };
        if (query.unidadeId) where.unidadeId = query.unidadeId;
        if (query.clienteId) where.clienteId = query.clienteId;
        if (query.status) where.status = query.status;

        return this.reservaModel.findAll({
            where,
            include: [
                { model: Unidade, attributes: ['id', 'codigoInterno', 'tipo'], where: { tenantId }, required: false },
                { model: Cliente, attributes: ['id', 'nome', 'email', 'telefone'], where: { tenantId }, required: false }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    async findOne(tenantId: string, id: string): Promise<Reserva> {
        return this.reservaModel.findOne({
            where: { id, tenantId },
            include: [
                { model: Unidade, where: { tenantId }, required: false },
                { model: Cliente, where: { tenantId }, required: false },
            ]
        });
    }

    async update(tenantId: string, id: string, data: Partial<Reserva>): Promise<Reserva> {
        const reserva = await this.reservaModel.findOne({ where: { id, tenantId } });
        if (!reserva) throw new BadRequestException('Reserva nao encontrada');

        const { tenantId: _tenantId, tenant_id: _tenantIdSnake, ...safeData } = (data || {}) as any;
        return reserva.update(safeData);
    }

    async cancel(tenantId: string, id: string): Promise<void> {
        const reserva = await this.reservaModel.findOne({ where: { id, tenantId } });
        if (!reserva) throw new BadRequestException('Reserva nao encontrada');

        if (reserva.status === 'ATIVA') {
            await reserva.update({ status: 'CANCELADA' });

            const unidade = await this.unidadeModel.findOne({ where: { id: reserva.unidadeId, tenantId } });
            if (unidade) {
                await unidade.update({ statusUnidade: 'DISPONIVEL' });
            }
        }
    }

    async verifyExpiredReservations(tenantId: string): Promise<number> {
        const activeReservas = await this.reservaModel.findAll({ where: { tenantId, status: 'ATIVA' } });
        const now = new Date();
        let processed = 0;

        for (const res of activeReservas) {
            const dataFim = new Date(res.dataFim);
            const expirationAt = new Date(dataFim);
            expirationAt.setHours(23, 59, 59, 999);

            if (now <= expirationAt) continue;

            await res.update({ status: 'EXPIRADA' });
            processed += 1;

            const unit = await this.unidadeModel.findOne({ where: { id: res.unidadeId, tenantId } });
            if (unit && unit.statusUnidade === 'RESERVADO') {
                await unit.update({ statusUnidade: 'DISPONIVEL' });
            }
        }

        return processed;
    }
}
