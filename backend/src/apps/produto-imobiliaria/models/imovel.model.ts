import { Table, Column, Model, DataType, PrimaryKey, Default } from 'sequelize-typescript';

@Table({
    tableName: 'imoveis',
    timestamps: true,
})
export class Imovel extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    id: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        unique: true,
        autoIncrement: true,
    })
    codigo: number;

    @Default('default')
    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: 'tenant_id',
    })
    tenantId: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    titulo: string; // Título do anúncio

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    valor: number;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    apresentacao: string; // Descrição detalhada/HTML

    @Column({
        type: DataType.ENUM('CASA', 'APARTAMENTO', 'COMERCIAL', 'TERRENO'),
        allowNull: false,
        defaultValue: 'CASA',
    })
    tipo: string;

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    localizacao: string; // Bairro/Cidade

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true,
    })
    isAtivo: boolean;
}
