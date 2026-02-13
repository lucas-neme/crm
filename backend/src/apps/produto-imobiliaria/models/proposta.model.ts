import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Unidade } from './unidade.model';
import { Cliente } from '../../cliente/models/cliente.model';

@Table({
    tableName: 'propostas',
    timestamps: true,
})
export class Proposta extends Model {
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
        field: 'valor_proposto',
        type: DataType.DECIMAL(15, 2),
        allowNull: false
    })
    valorProposto: number;

    @Column({
        field: 'condicoes_pagamento',
        type: DataType.JSONB,
        defaultValue: {}
    })
    condicoesPagamento: any;

    @Column({
        type: DataType.ENUM('ENVIADA', 'ANALISE', 'ACEITA', 'RECUSADA'),
        defaultValue: 'ENVIADA'
    })
    status: string;

    @Column({
        field: 'data_proposta',
        type: DataType.DATE,
        defaultValue: DataType.NOW
    })
    dataProposta: Date;

    @Column(DataType.TEXT) observacoes: string;
}
