import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { StatusConta } from './conta-pagar.model'; // Reusing enum for simplicity
import { Cliente } from '../../cliente/models/cliente.model';

@Table({
    tableName: 'contas_receber',
    timestamps: true,
})
export class ContaReceber extends Model {
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
        field: 'dt_recebimento',
    })
    dtRecebimento: string;

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

    @ForeignKey(() => Cliente)
    @Column({
        type: DataType.UUID,
        allowNull: true,
        field: 'cliente_id',
    })
    clienteId: string;

    @BelongsTo(() => Cliente)
    cliente: Cliente;

    // Could link to Cliente, Negocio etc. For now keeping simple.
}
