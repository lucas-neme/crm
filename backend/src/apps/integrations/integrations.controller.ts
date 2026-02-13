import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/sequelize';
import { Cliente } from '../cliente/models/cliente.model';
import { Negocio } from '../negocio/models/negocio.model';
import { Produto } from '../produto/models/produto.model';
import { Op } from 'sequelize';

@ApiTags('integrations')
@Controller('api/integrations')
export class IntegrationsController {
  constructor(
    @InjectModel(Cliente)
    private readonly clienteModel: typeof Cliente,
    @InjectModel(Negocio)
    private readonly negocioModel: typeof Negocio,
    @InjectModel(Produto)
    private readonly produtoModel: typeof Produto,
  ) {}

  @Get('clientes/export')
  @ApiOperation({ summary: 'Exportar dados de clientes para integração (Power BI/n8n)' })
  @ApiResponse({ status: 200, description: 'Dados exportados com sucesso' })
  @ApiQuery({ name: 'dataInicio', required: false, description: 'Data inicial (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dataFim', required: false, description: 'Data final (YYYY-MM-DD)' })
  async exportClientes(
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    const where: any = {};

    if (dataInicio || dataFim) {
      where.createdAt = {};
      if (dataInicio) where.createdAt[Op.gte] = new Date(dataInicio);
      if (dataFim) where.createdAt[Op.lte] = new Date(dataFim);
    }

    const clientes = await this.clienteModel.findAll({
      where,
      attributes: [
        'id',
        'codigo',
        'nome',
        'email',
        'telefone',
        'tipoPessoa',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
      raw: true,
    });

    return {
      success: true,
      timestamp: new Date().toISOString(),
      count: clientes.length,
      data: clientes,
    };
  }

  @Get('negocios/export')
  @ApiOperation({ summary: 'Exportar dados de negócios para integração (Power BI/n8n)' })
  @ApiResponse({ status: 200, description: 'Dados exportados com sucesso' })
  @ApiQuery({ name: 'dataInicio', required: false, description: 'Data inicial de venda (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dataFim', required: false, description: 'Data final de venda (YYYY-MM-DD)' })
  async exportNegocios(
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    const where: any = {};

    if (dataInicio || dataFim) {
      where.dataVenda = {};
      if (dataInicio) where.dataVenda[Op.gte] = dataInicio;
      if (dataFim) where.dataVenda[Op.lte] = dataFim;
    }

    const negocios = await this.negocioModel.findAll({
      where,
      include: [
        {
          model: Cliente,
          attributes: ['id', 'codigo', 'nome', 'tipoPessoa'],
        },
        {
          model: Produto,
          attributes: ['id', 'nome', 'valorUnitario'],
          through: { attributes: ['quantidade', 'valorUnitario'] },
        },
      ],
    });

    const formattedData = negocios.map((negocio: any) => ({
      id: negocio.id,
      codigo: negocio.codigo,
      dataVenda: negocio.dataVenda,
      dataEntrega: negocio.dataEntrega,
      entrega: negocio.entrega,
      valorFinal: parseFloat(negocio.valorFinal),
      clienteId: negocio.clienteId,
      clienteCodigo: negocio.cliente?.codigo,
      clienteNome: negocio.cliente?.nome,
      clienteTipoPessoa: negocio.cliente?.tipoPessoa,
      quantidadeItens: negocio.produtos?.length || 0,
      produtos: negocio.produtos?.map((p: any) => ({
        produtoId: p.id,
        produtoNome: p.nome,
        quantidade: p.NegocioProduto?.quantidade,
        valorUnitario: parseFloat(p.NegocioProduto?.valorUnitario || p.valorUnitario),
        subtotal: parseFloat(p.NegocioProduto?.quantidade || 0) * parseFloat(p.NegocioProduto?.valorUnitario || p.valorUnitario || 0),
      })),
      createdAt: negocio.createdAt,
      updatedAt: negocio.updatedAt,
    }));

    return {
      success: true,
      timestamp: new Date().toISOString(),
      count: formattedData.length,
      data: formattedData,
    };
  }

  @Get('produtos/export')
  @ApiOperation({ summary: 'Exportar dados de produtos para integração (Power BI/n8n)' })
  @ApiResponse({ status: 200, description: 'Dados exportados com sucesso' })
  async exportProdutos() {
    const produtos = await this.produtoModel.findAll({
      attributes: [
        'id',
        'codigo',
        'nome',
        'valorUnitario',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
      raw: true,
    });

    return {
      success: true,
      timestamp: new Date().toISOString(),
      count: produtos.length,
      data: produtos.map(p => ({
        ...p,
        valorUnitario: parseFloat(p.valorUnitario as any),
      })),
    };
  }

  @Get('dashboard/resumo')
  @ApiOperation({ summary: 'Dados resumidos para dashboard (Power BI)' })
  @ApiResponse({ status: 200, description: 'Resumo dos dados' })
  @ApiQuery({ name: 'dataInicio', required: false })
  @ApiQuery({ name: 'dataFim', required: false })
  async dashboardResumo(
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    const whereNegocio: any = {};
    
    if (dataInicio || dataFim) {
      whereNegocio.dataVenda = {};
      if (dataInicio) whereNegocio.dataVenda[Op.gte] = dataInicio;
      if (dataFim) whereNegocio.dataVenda[Op.lte] = dataFim;
    }

    const [
      totalClientes,
      clientesAtivos,
      totalProdutos,
      produtosAtivos,
      negocios,
    ] = await Promise.all([
      this.clienteModel.count(),
      this.clienteModel.count({ where: { isActive: true } }),
      this.produtoModel.count(),
      this.produtoModel.count({ where: { isActive: true } }),
      this.negocioModel.findAll({
        where: whereNegocio,
        attributes: ['valorFinal', 'dataVenda', 'entrega'],
        raw: true,
      }),
    ]);

    const totalVendas = negocios.length;
    const valorTotalVendas = negocios.reduce((sum, n) => sum + parseFloat(n.valorFinal as any), 0);
    const vendasComEntrega = negocios.filter(n => n.entrega).length;

    return {
      success: true,
      timestamp: new Date().toISOString(),
      periodo: {
        dataInicio: dataInicio || null,
        dataFim: dataFim || null,
      },
      resumo: {
        clientes: {
          total: totalClientes,
          ativos: clientesAtivos,
          inativos: totalClientes - clientesAtivos,
        },
        produtos: {
          total: totalProdutos,
          ativos: produtosAtivos,
          inativos: totalProdutos - produtosAtivos,
        },
        vendas: {
          total: totalVendas,
          valorTotal: parseFloat(valorTotalVendas.toFixed(2)),
          ticketMedio: totalVendas > 0 ? parseFloat((valorTotalVendas / totalVendas).toFixed(2)) : 0,
          comEntrega: vendasComEntrega,
          semEntrega: totalVendas - vendasComEntrega,
        },
      },
    };
  }
}
