import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Empreendimento } from './empreendimento.model';

@Table({
    tableName: 'unidades',
    timestamps: true,
})
export class Unidade extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    id: string;

    @ForeignKey(() => Empreendimento)
    @Column({
        field: 'empreendimento_id',
        type: DataType.UUID,
        allowNull: false,
    })
    empreendimentoId: string;

    @Default('default')
    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: 'tenant_id',
    })
    tenantId: string;

    @BelongsTo(() => Empreendimento)
    empreendimento: Empreendimento;

    @Column({
        field: 'codigo_interno',
        allowNull: false,
    })
    codigoInterno: string;

    // Caracteristicas
    @Column({
        type: DataType.ENUM('CASA', 'APARTAMENTO', 'COMERCIAL', 'TERRENO'),
        allowNull: false,
    })
    tipo: string;

    @Column(DataType.STRING) tipologia: string;
    @Column(DataType.STRING) torre: string;
    @Column(DataType.STRING) andar: string;
    @Column({ field: 'numero_unidade' }) numeroUnidade: string;

    // Metragens
    @Column({ field: 'area_total', type: DataType.DECIMAL(10, 2) }) areaTotal: number;
    @Column({ field: 'area_privativa', type: DataType.DECIMAL(10, 2) }) areaPrivativa: number;

    @Column(DataType.INTEGER) quartos: number;
    @Column(DataType.INTEGER) suites: number;
    @Column(DataType.INTEGER) banheiros: number;
    @Column(DataType.INTEGER) vagas: number;

    // Valores
    @Column({ field: 'valor_tabela', type: DataType.DECIMAL(15, 2) }) valorTabela: number;
    @Column({ field: 'valor_oferta', type: DataType.DECIMAL(15, 2) }) valorOferta: number;
    @Column({ field: 'valor_min_negociavel', type: DataType.DECIMAL(15, 2) }) valorMinNegociavel: number;

    // Status
    @Column({
        field: 'status_unidade',
        type: DataType.ENUM('DISPONIVEL', 'RESERVADO', 'PROPOSTA', 'VENDIDO', 'DISTRATO'),
        defaultValue: 'DISPONIVEL'
    })
    statusUnidade: string;

    @Column({
        field: 'status_publicacao',
        type: DataType.ENUM('RASCUNHO', 'PUBLICADO', 'PAUSADO'),
        defaultValue: 'RASCUNHO'
    })
    statusPublicacao: string;

    // Publicacao
    @Column({ field: 'canais_publicacao', type: DataType.JSONB, defaultValue: [] }) canaisPublicacao: string[];
    @Column({ field: 'link_anuncio' }) linkAnuncio: string;
    @Column(DataType.STRING) headline: string;
    @Column(DataType.TEXT) descricao: string;
    @Column({ type: DataType.JSONB, defaultValue: [] }) tags: string[];
    @Column({ type: DataType.JSONB, defaultValue: [] }) midias: any[];
}
