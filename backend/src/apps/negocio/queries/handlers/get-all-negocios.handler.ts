import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { GetAllNegociosQuery } from '../impl/get-all-negocios.query';
import { Negocio } from '../../models/negocio.model';
import { Produto } from '@/apps/produto/models/produto.model';
import { Cliente } from '@/apps/cliente/models/cliente.model';
import { NegocioProduto } from '../../models/negocio-produto.model';
import { Unidade } from '@/apps/produto-imobiliaria/models/unidade.model';
import { Op } from 'sequelize';

@QueryHandler(GetAllNegociosQuery)
export class GetAllNegociosHandler implements IQueryHandler<GetAllNegociosQuery> {
  constructor(
    @InjectModel(Negocio)
    private readonly negocioModel: typeof Negocio,
    @InjectModel(NegocioProduto)
    private readonly negocioProdutoModel: typeof NegocioProduto,
    @InjectModel(Produto)
    private readonly produtoModel: typeof Produto,
    @InjectModel(Unidade)
    private readonly unidadeModel: typeof Unidade,
  ) { }

  async execute(query: GetAllNegociosQuery): Promise<any[]> {
    const { tenantId } = query;
    const negocios = await this.negocioModel.findAll({
      where: { tenantId },
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
    const negocioIds = negocios.map((n: any) => n.id);
    const itens = negocioIds.length > 0
      ? await this.negocioProdutoModel.findAll({
        where: { negocioId: { [Op.in]: negocioIds }, tenantId },
        attributes: ['negocioId', 'produtoId', 'quantidade', 'valorUnitario', 'desconto'],
      })
      : [];

    const produtoIds = Array.from(new Set(itens.map((i: any) => i.produtoId).filter(Boolean)));

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
    const itensByNegocio = new Map<string, any[]>();

    for (const item of itens as any[]) {
      const produto = produtoMap.get(item.produtoId);
      const unidade = unidadeMap.get(item.produtoId);
      const produtoNome = produto?.nome || (unidade ? `Unidade ${unidade.codigoInterno || unidade.id}` : item.produtoId);
      const valorFallback = unidade?.valorOferta ?? unidade?.valorTabela ?? 0;

      const mapped = {
        produtoId: item.produtoId,
        produtoNome,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario ?? produto?.valorUnitario ?? valorFallback,
        desconto: item.desconto || 0,
      };

      const list = itensByNegocio.get(item.negocioId) || [];
      list.push(mapped);
      itensByNegocio.set(item.negocioId, list);
    }

    return negocios.map((negocio: any) => ({
      id: negocio.id,
      codigo: negocio.codigo,
      clienteId: negocio.clienteId,
      cliente: negocio.cliente,
      entrega: negocio.entrega,
      enderecoEntregaId: negocio.enderecoEntregaId,
      dataEntrega: negocio.dataEntrega,
      dataVenda: negocio.dataVenda,
      valorFinal: negocio.valorFinal,
      descontoGeral: negocio.descontoGeral,
      produtos: itensByNegocio.get(negocio.id) || [],
    }));
  }
}
