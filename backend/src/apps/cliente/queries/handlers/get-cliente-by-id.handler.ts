import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { I18nService } from 'nestjs-i18n';
import { NotFoundException } from '@nestjs/common';
import { GetClienteByIdQuery } from '../impl/get-cliente-by-id.query';
import { Cliente } from '../../models/cliente.model';

@QueryHandler(GetClienteByIdQuery)
export class GetClienteByIdHandler implements IQueryHandler<GetClienteByIdQuery> {
  constructor(
    @InjectModel(Cliente)
    private readonly clienteModel: typeof Cliente,
    private readonly i18n: I18nService,
  ) { }

  async execute(query: GetClienteByIdQuery): Promise<Cliente> {
    const { tenantId, id } = query;

    const cliente = await this.clienteModel.findOne({
      where: { id, tenantId },
      attributes: [
        'id',
        'codigo',
        'nome',
        'email',
        'telefone',
        'tipoPessoa',
        'isAtivo',
        'dtNascimento',
        'documento',
        'tipoCliente',
        'observacoes',
        'chatId',
        'origem',
        'interesse',
        'pipelineStage',
        'temperatura',
        'dataUltimaInteracao',
        'enderecoId',
      ],
      raw: true,
    });

    if (!cliente) {
      throw new NotFoundException(await this.i18n.translate('cliente.notFound'));
    }

    return cliente;
  }
}
