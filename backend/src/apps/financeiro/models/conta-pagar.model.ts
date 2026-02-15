import { Table, Column, Model, DataType, PrimaryKey, Default } from 'sequelize-typescript';

export enum StatusConta {
    PENDENTE = 'PENDENTE',
    PAGO = 'PAGO',
    CANCELADO = 'CANCELADO',
    ATRASADO = 'ATRASADO'
}

@Table({
    tableName: 'contas_pagar',
    timestamps: true,
})
export class ContaPagar extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    descricao: string;

    @Default('default')
    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: 'tenant_id',
    })
    tenantId: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    valor: number;

    @Column({
        type: DataType.DATEONLY,
        allowNull: false,
        field: 'dt_vencimento',
    })
    dtVencimento: string;

    @Column({
        type: DataType.DATEONLY,
        allowNull: true,
        field: 'dt_pagamento',
    })
    dtPagamento: string;

    @Default(StatusConta.PENDENTE)
    @Column({
        type: DataType.ENUM(...Object.values(StatusConta)),
        allowNull: false,
    })
    status: StatusConta;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'observacoes',
    })
    observacoes: string;
}
