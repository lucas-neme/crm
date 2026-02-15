import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { I18nService } from 'nestjs-i18n';
import { NotFoundException } from '@nestjs/common';
import { GetNegocioByIdQuery } from '../impl/get-negocio-by-id.query';
import { Negocio } from '../../models/negocio.model';
import { Produto } from '@/apps/produto/models/produto.model';
import { Cliente } from '@/apps/cliente/models/cliente.model';
import { NegocioProduto } from '../../models/negocio-produto.model';
import { Unidade } from '@/apps/produto-imobiliaria/models/unidade.model';
import { Op } from 'sequelize';

@QueryHandler(GetNegocioByIdQuery)
export class GetNegocioByIdHandler implements IQueryHandler<GetNegocioByIdQuery> {
  constructor(
    @InjectModel(Negocio)
    private readonly negocioModel: typeof Negocio,
    @InjectModel(NegocioProduto)
    private readonly negocioProdutoModel: typeof NegocioProduto,
    @InjectModel(Produto)
    private readonly produtoModel: typeof Produto,
    @InjectModel(Unidade)
    private readonly unidadeModel: typeof Unidade,
    private readonly i18n: I18nService,
  ) { }

  async execute(query: GetNegocioByIdQuery): Promise<any> {
    const { tenantId, id } = query;

    const negocio = await this.negocioModel.findOne({
      where: { id, tenantId },
      attributes: ['id', 'codigo', 'clienteId', 'entrega', 'enderecoEntregaId', 'dataEntrega', 'dataVenda', 'valorFinal', 'descontoGeral'],
      include: [
        {
          model: Cliente,
          attributes: ['id', 'nome'],
          where: { tenantId },
          required: false,
        },
      ],
    });

    if (!negocio) {
      throw new NotFoundException(await this.i18n.translate('negocio.notFound'));
    }
    const itens = await this.negocioProdutoModel.findAll({
      where: { negocioId: id, tenantId },
      attributes: ['negocioId', 'produtoId', 'quantidade', 'valorUnitario', 'desconto'],
    });

    const produtoIds = Array.from(new Set((itens as any[]).map((i: any) => i.produtoId).filter(Boolean)));
    const [produtos, unidades] = await Promise.all([
      produtoIds.length > 0
        ? this.produtoModel.findAll({
          where: { id: { [Op.in]: produtoIds }, tenantId },
          attributes: ['id', 'nome', 'valorUnitario'],
        })
        : Promise.resolve([]),
      produtoIds.length > 0
        ? this.unidadeModel.findAll({
          where: { id: { [Op.in]: produtoIds }, tenantId },
          attributes: ['id', 'codigoInterno', 'tipo', 'valorOferta', 'valorTabela'],
        })
        : Promise.resolve([]),
    ]);

    const produtoMap = new Map((produtos as any[]).map((p: any) => [p.id, p]));
    const unidadeMap = new Map((unidades as any[]).map((u: any) => [u.id, u]));

    return {
      id: (negocio as any).id,
      codigo: (negocio as any).codigo,
      clienteId: (negocio as any).clienteId,
      cliente: (negocio as any).cliente,
      entrega: (negocio as any).entrega,
      enderecoEntregaId: (negocio as any).enderecoEntregaId,
      dataEntrega: (negocio as any).dataEntrega,
      dataVenda: (negocio as any).dataVenda,
      valorFinal: (negocio as any).valorFinal,
      descontoGeral: (negocio as any).descontoGeral,
      produtos: (itens as any[]).map((item: any) => {
        const produto = produtoMap.get(item.produtoId);
        const unidade = unidadeMap.get(item.produtoId);
        const produtoNome = produto?.nome || (unidade ? `Unidade ${unidade.codigoInterno || unidade.id}` : item.produtoId);
        const valorFallback = unidade?.valorOferta ?? unidade?.valorTabela ?? 0;

        return {
          produtoId: item.produtoId,
          produtoNome,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario ?? produto?.valorUnitario ?? valorFallback,
          desconto: item.desconto || 0,
        };
      }),
    };
  }
}
