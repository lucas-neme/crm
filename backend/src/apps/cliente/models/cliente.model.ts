import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Endereco } from '@/common/models/endereco.model';
import { PessoaTipoEnum } from '../../../common/enums/pessoa-tipo.enum';

@Table({
  tableName: 'clientes',
  timestamps: true,
})
export class Cliente extends Model {
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

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nome: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  telefone: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email: string;

  @Default('default')
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'tenant_id',
  })
  tenantId: string;

  @Column({
    type: DataType.ENUM(...Object.values(PessoaTipoEnum)),
    allowNull: false,
    field: 'tipo_pessoa',
  })
  tipoPessoa: PessoaTipoEnum;

  @ForeignKey(() => Endereco)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  enderecoId: string;

  @BelongsTo(() => Endereco)
  endereco: Endereco;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
    field: 'dt_nascimento',
  })
  dtNascimento: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  documento: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'tipo_cliente',
  })
  tipoCliente: string; // VENDA, COMPRA, ALUGUEL

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  observacoes: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'chat_id',
  })
  chatId: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isAtivo: boolean;

  // --- Lead Fields ---
  @Column(DataType.STRING) origem: string; // INSTAGRAM, ETC
  @Column(DataType.STRING) interesse: string; // COMPRA, VENDA

  @Column({
    field: 'pipeline_stage',
    type: DataType.STRING,
    defaultValue: 'NOVO'
  })
  pipelineStage: string;

  @Column(DataType.STRING) temperatura: string; // FRIA, MORNA, QUENTE
  @Column({ field: 'data_ultima_interacao', type: DataType.DATE }) dataUltimaInteracao: Date;

  @HasMany(() => Endereco, 'clienteId')
  enderecos: Endereco[];
}
