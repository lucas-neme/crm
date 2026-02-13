import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

@Table({
    tableName: 'configuracoes',
    timestamps: true,
})
export class Configuracao extends Model {
    @PrimaryKey
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    chave: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    valor: string;
}
