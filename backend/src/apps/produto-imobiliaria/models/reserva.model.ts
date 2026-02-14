import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Unidade } from './unidade.model';
import { Cliente } from '../../cliente/models/cliente.model';

@Table({
    tableName: 'reservas',
    timestamps: true,
})
export class Reserva extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    id: string;

    @ForeignKey(() => Unidade)
    @Column({
        field: 'unidade_id',
        type: DataType.UUID,
        allowNull: false,
    })
    unidadeId: string;

    @BelongsTo(() => Unidade)
    unidade: Unidade;

    @ForeignKey(() => Cliente)
    @Column({
        field: 'cliente_id',
        type: DataType.UUID,
        allowNull: false,
    })
    clienteId: string;

    @BelongsTo(() => Cliente)
    cliente: Cliente;

    @Column({
        field: 'usuario_id',
        type: DataType.UUID,
        allowNull: true
    })
    usuarioId: string; // Corretor

    @Column({
        field: 'data_inicio',
        type: DataType.DATE,
        defaultValue: DataType.NOW
    })
    dataInicio: Date;

    @Column({
        field: 'data_fim',
        type: DataType.DATE,
        allowNull: false
    })
    dataFim: Date;

    @Column({
        type: DataType.ENUM('ATIVA', 'VENCIDA', 'CANCELADA', 'CONVERTIDA', 'EXPIRADA'),
        defaultValue: 'ATIVA'
    })
    status: string;

    @Column(DataType.TEXT) observacoes: string;
}
