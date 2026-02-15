import { Table, Column, Model, DataType, PrimaryKey, Default } from 'sequelize-typescript';

@Table({
  tableName: 'enderecos',
  timestamps: true,
})
export class Endereco extends Model {
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
  logradouro: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  numero: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  complemento: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  bairro: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  cidade: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  estado: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  pais: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  cep: string;

  @Default('default')
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'tenant_id',
  })
  tenantId: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'is_preferencial'
  })
  isPreferencial: boolean;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'cliente_id'
  })
  clienteId: string;
}
