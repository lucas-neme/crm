import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { Negocio } from './negocio.model';
import { Produto } from '@/apps/produto/models/produto.model';

@Table({
  tableName: 'negocio_produtos',
  timestamps: false,
})
export class NegocioProduto extends Model {
  @ForeignKey(() => Negocio)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'negocio_id'
  })
  negocioId: string;

  @ForeignKey(() => Produto)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'produto_id'
  })
  produtoId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  quantidade: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'valor_unitario'
  })
  valorUnitario: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  })
  desconto: number;
}
