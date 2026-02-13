import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { I18nService } from 'nestjs-i18n';
import { CreateNegocioCommand } from '../impl/create-negocio.command';
import { Negocio } from '../../models/negocio.model';
import { NegocioProduto } from '../../models/negocio-produto.model';
import { FinanceiroService } from '@/apps/financeiro/services/financeiro.service';
import { Produto } from '@/apps/produto/models/produto.model';
import { Unidade } from '@/apps/produto-imobiliaria/models/unidade.model';

@CommandHandler(CreateNegocioCommand)
export class CreateNegocioHandler implements ICommandHandler<CreateNegocioCommand> {
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
    private readonly financeiroService: FinanceiroService,
  ) { }

  async execute(command: CreateNegocioCommand): Promise<Negocio> {
    const { data } = command;

    try {
      const subtotal = data.produtos.reduce(
        (acc, produto) => {
          const vlr = Number(produto.valorUnitario) || 0;
          const qtd = Number(produto.quantidade) || 0;
          const desc = Number(produto.desconto) || 0;
          return acc + (qtd * vlr) - desc;
        },
        0,
      );

      const valorFinal = Math.max(0, subtotal - (Number(data.descontoGeral) || 0));

      // Gerar código sequencial
      const ultimoNegocio = await this.negocioModel.findOne({
        order: [['codigo', 'DESC']],
        raw: true,
      });
      const novoCodigo = ultimoNegocio && ultimoNegocio.codigo ? ultimoNegocio.codigo + 1 : 1;

      const negocio = await this.negocioModel.create({
        codigo: novoCodigo,
        clienteId: data.clienteId,
        entrega: data.entrega,
        enderecoEntregaId: data.enderecoEntregaId,
        dataEntrega: data.dataEntrega ? new Date(data.dataEntrega) : null,
        dataVenda: data.dataVenda,
        valorFinal,
        descontoGeral: data.descontoGeral || 0,
      });

      for (const produto of data.produtos) {
        let produtoRef = await this.produtoModel.findByPk(produto.produtoId);

        if (!produtoRef) {
          const unidade = await this.unidadeModel.findByPk(produto.produtoId);
          if (unidade) {
            const ultimoProduto = await this.produtoModel.findOne({
              order: [['codigo', 'DESC']],
              raw: true,
            });
            const novoCodigoProduto = ultimoProduto && (ultimoProduto as any).codigo ? (ultimoProduto as any).codigo + 1 : 1;
            produtoRef = await this.produtoModel.create({
              id: unidade.id,
              codigo: novoCodigoProduto,
              nome: `Unidade ${unidade.codigoInterno || unidade.id}`,
              quantidade: 1,
              valorUnitario: produto.valorUnitario || (unidade as any).valorOferta || (unidade as any).valorTabela || 0,
              isActive: true,
            } as any);
          }
        }

        await this.negocioProdutoModel.create({
          negocioId: negocio.id,
          produtoId: produtoRef ? produtoRef.id : produto.produtoId,
          quantidade: produto.quantidade,
          valorUnitario: produto.valorUnitario,
          desconto: produto.desconto || 0,
        });
      }

      // Criar Conta a Receber automaticamente
      await this.financeiroService.createReceber({
        clienteId: negocio.clienteId,
        valor: negocio.valorFinal,
        descricao: `Negócio #${negocio.codigo}`,
        dtVencimento: new Date().toISOString().split('T')[0], // Hoje como padrão
        status: 'PENDENTE'
      } as any);

      return negocio;
    } catch (error) {
      console.error('Erro ao criar negócio:', error);
      throw error;
    }
  }
}
