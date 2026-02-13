import { Table, Column, Model, DataType, PrimaryKey, Default, HasMany } from 'sequelize-typescript';
import { Unidade } from './unidade.model';

@Table({
    tableName: 'empreendimentos',
    timestamps: true,
})
export class Empreendimento extends Model {
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
    nome: string;

    @Column({
        type: DataType.ENUM('LANCAMENTO', 'EM_OBRAS', 'PRONTO', 'ESGOTADO'),
        defaultValue: 'LANCAMENTO',
    })
    status: string;

    @Column({
        type: DataType.DATEONLY,
        field: 'previsao_entrega',
    })
    previsaoEntrega: string;

    @Column({ type: DataType.TEXT, field: 'descricao_curta' })
    descricaoCurta: string;

    @Column({ type: DataType.TEXT, field: 'descricao_longa' })
    descricaoLonga: string;

    // Endereço
    @Column({ field: 'endereco_cep' }) enderecoCep: string;
    @Column({ field: 'endereco_logradouro' }) enderecoLogradouro: string;
    @Column({ field: 'endereco_numero' }) enderecoNumero: string;
    @Column({ field: 'endereco_complemento' }) enderecoComplemento: string;
    @Column({ field: 'endereco_bairro' }) enderecoBairro: string;
    @Column({ field: 'endereco_cidade' }) enderecoCidade: string;
    @Column({ field: 'endereco_uf' }) enderecoUf: string;

    @Column({
        type: DataType.JSONB,
        defaultValue: [],
    })
    midias: any[];

    @Column({
        field: 'regras_comissao',
        type: DataType.JSONB,
        defaultValue: {},
    })
    regrasComissao: any;

    @Column({
        field: 'is_ativo',
        type: DataType.BOOLEAN,
        defaultValue: true,
    })
    isAtivo: boolean;

    @HasMany(() => Unidade)
    unidades: Unidade[];
}
