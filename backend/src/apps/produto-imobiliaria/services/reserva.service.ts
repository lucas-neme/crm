import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Reserva } from '../models/reserva.model';
import { Unidade } from '../models/unidade.model';
import { Cliente } from '../../cliente/models/cliente.model';
import { Op } from 'sequelize';

@Injectable()
export class ReservaService {
    constructor(
        @InjectModel(Reserva)
        private readonly reservaModel: typeof Reserva,
        @InjectModel(Unidade)
        private readonly unidadeModel: typeof Unidade,
    ) { }

    async create(data: Partial<Reserva>): Promise<Reserva> {
        const unidade = await this.unidadeModel.findByPk(data.unidadeId);
        if (!unidade) throw new BadRequestException('Unidade não encontrada');

        if (unidade.statusUnidade !== 'DISPONIVEL') {
            throw new BadRequestException('Unidade não está disponível para reserva');
        }

        // Check for active reservations just in case (race condition check skipped for MVP)
        const activeReserva = await this.reservaModel.findOne({
            where: {
                unidadeId: data.unidadeId,
                status: 'ATIVA',
                dataFim: { [Op.gt]: new Date() }
            }
        });

        if (activeReserva) {
            throw new BadRequestException('Já existe uma reserva ativa para esta unidade');
        }

        const reserva = await this.reservaModel.create(data);

        // Update statusUnidade
        await unidade.update({ statusUnidade: 'RESERVADO' });

        return reserva;
    }

    async findAll(query: any = {}): Promise<Reserva[]> {
        const where: any = {};
        if (query.unidadeId) where.unidadeId = query.unidadeId;
        if (query.clienteId) where.clienteId = query.clienteId;
        if (query.status) where.status = query.status;

        return this.reservaModel.findAll({
            where,
            include: [
                { model: Unidade, attributes: ['id', 'codigoInterno', 'tipo'] },
                { model: Cliente, attributes: ['id', 'nome', 'email', 'telefone'] }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    async findOne(id: string): Promise<Reserva> {
        return this.reservaModel.findByPk(id, {
            include: [Unidade, Cliente]
        });
    }

    async update(id: string, data: Partial<Reserva>): Promise<Reserva> {
        const reserva = await this.reservaModel.findByPk(id);
        if (!reserva) throw new BadRequestException('Reserva não encontrada');

        return reserva.update(data);
    }

    async cancel(id: string): Promise<void> {
        const reserva = await this.reservaModel.findByPk(id);
        if (!reserva) throw new BadRequestException('Reserva não encontrada');

        if (reserva.status === 'ATIVA') {
            await reserva.update({ status: 'CANCELADA' });

            // Free the unit
            // Verify if there are no OTHER active reservations (unlikely but safe)
            const unidade = await this.unidadeModel.findByPk(reserva.unidadeId);
            if (unidade) {
                await unidade.update({ statusUnidade: 'DISPONIVEL' });
            }
        }
    }

    async verifyExpiredReservations(): Promise<number> {
        const expired = await this.reservaModel.findAll({
            where: {
                status: 'ATIVA',
                dataFim: { [Op.lt]: new Date() }
            }
        });

        for (const res of expired) {
            await res.update({ status: 'EXPIRADA' });

            // Check if unity should be freed
            const unit = await this.unidadeModel.findByPk(res.unidadeId);
            if (unit && unit.statusUnidade === 'RESERVADO') {
                await unit.update({ statusUnidade: 'DISPONIVEL' });
            }
        }

        return expired.length;
    }
}
