import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { I18nService } from 'nestjs-i18n';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateNegocioCommand } from '../impl/update-negocio.command';
import { Negocio } from '../../models/negocio.model';
import { NegocioProduto } from '../../models/negocio-produto.model';
import { Endereco } from '@/common/models/endereco.model';
import { Produto } from '@/apps/produto/models/produto.model';
import { Unidade } from '@/apps/produto-imobiliaria/models/unidade.model';

@CommandHandler(UpdateNegocioCommand)
export class UpdateNegocioHandler implements ICommandHandler<UpdateNegocioCommand> {
  constructor(
    @InjectModel(Negocio)
    private readonly negocioModel: typeof Negocio,
    @InjectModel(NegocioProduto)
    private readonly negocioProdutoModel: typeof NegocioProduto,
    @InjectModel(Endereco)
    private readonly enderecoModel: typeof Endereco,
    @InjectModel(Produto)
    private readonly produtoModel: typeof Produto,
    @InjectModel(Unidade)
    private readonly unidadeModel: typeof Unidade,
    private readonly i18n: I18nService,
  ) {}

  async execute(command: UpdateNegocioCommand): Promise<Negocio> {
    const { id, data } = command;

    const negocio = await this.negocioModel.findByPk(id);

    if (!negocio) {
      throw new NotFoundException(await this.i18n.translate('negocio.notFound'));
    }

    // Validar se entrega é true e endereço foi fornecido
    if (data.entrega !== undefined && data.entrega && !data.enderecoEntrega && !negocio.enderecoEntregaId) {
      throw new BadRequestException(
        await this.i18n.translate('negocio.enderecoRequired'),
      );
    }

    let enderecoEntrega = null;
    if (data.entrega && data.enderecoEntrega) {
      enderecoEntrega = await this.enderecoModel.create(data.enderecoEntrega as any);
    }

    // Atualizar produtos se fornecidos
    if (data.produtos) {
      // Remover produtos antigos
      await this.negocioProdutoModel.destroy({
        where: { negocioId: id },
      });

      // Adicionar novos produtos
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
          negocioId: id,
          produtoId: produtoRef ? produtoRef.id : produto.produtoId,
          quantidade: produto.quantidade,
          valorUnitario: produto.valorUnitario,
        });
      }

      // Recalcular valor final
      const valorFinal = data.produtos.reduce(
        (acc, produto) => acc + produto.quantidade * produto.valorUnitario,
        0,
      );
      data['valorFinal'] = valorFinal;
    }

    await negocio.update({
      ...data,
      enderecoEntregaId: enderecoEntrega?.id || negocio.enderecoEntregaId,
    });

    return negocio;
  }
}
