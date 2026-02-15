import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';
import { Endereco } from '@/common/models/endereco.model';
import { Produto } from '@/apps/produto/models/produto.model';
import { NegocioProduto } from './negocio-produto.model';
import { Cliente } from '@/apps/cliente/models/cliente.model';

@Table({
  tableName: 'negocios',
  timestamps: true,
})
export class Negocio extends Model {
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
    type: DataType.DATE,
    allowNull: true,
    field: 'data_entrega'
  })
  dataEntrega: Date;

  @ForeignKey(() => Cliente)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'cliente_id'
  })
  clienteId: string;

  @BelongsTo(() => Cliente)
  cliente: Cliente;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  entrega: boolean;

  @ForeignKey(() => Endereco)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'endereco_entrega_id'
  })
  enderecoEntregaId: string;

  @BelongsTo(() => Endereco)
  enderecoEntrega: Endereco;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'valor_final'
  })
  valorFinal: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'desconto_geral'
  })
  descontoGeral: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'data_venda',
  })
  dataVenda: string;

  @BelongsToMany(() => Produto, () => NegocioProduto)
  produtos: Produto[];
}
