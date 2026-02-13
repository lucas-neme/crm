import { Table, Column, Model, DataType, PrimaryKey, Default, HasOne } from 'sequelize-typescript';
import { Cliente } from './cliente.model';

export enum TipoDocumento {
  CPF = 'CPF',
  CNPJ = 'CNPJ',
  PASSAPORTE = 'PASSAPORTE',
}

@Table({
  tableName: 'documentos',
  timestamps: true,
})
export class Documento extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id: string;

  @Column({
    type: DataType.ENUM('CPF', 'CNPJ', 'PASSAPORTE'),
    allowNull: false,
  })
  tipo: TipoDocumento;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  numero: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isValido: boolean;

  @HasOne(() => Cliente, 'documentoId')
  cliente: Cliente;
}
