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
    type: DataType.STRING,
    allowNull: false,
    field: 'tenant_id',
    unique: 'documentos_tenant_numero_unique',
  })
  tenantId: string;

  @Column({
    type: DataType.ENUM('CPF', 'CNPJ', 'PASSAPORTE'),
    allowNull: false,
  })
  tipo: TipoDocumento;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: 'documentos_tenant_numero_unique',
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
