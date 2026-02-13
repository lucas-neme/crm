import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { GetAllClientesQuery } from '../impl/get-all-clientes.query';
import { Cliente } from '../../models/cliente.model';

@QueryHandler(GetAllClientesQuery)
export class GetAllClientesHandler implements IQueryHandler<GetAllClientesQuery> {
  constructor(
    @InjectModel(Cliente)
    private readonly clienteModel: typeof Cliente,
  ) { }

  async execute(query: GetAllClientesQuery): Promise<Cliente[]> {
    return await this.clienteModel.findAll({
      attributes: [
        'id',
        'codigo',
        'nome',
        'email',
        'telefone',
        'tipoPessoa',
        'isAtivo',
        'documento',
        'tipoCliente',
        'origem',
        'interesse',
        'pipelineStage',
        'temperatura',
        'dataUltimaInteracao',
      ],
      raw: true,
    });
  }
}
