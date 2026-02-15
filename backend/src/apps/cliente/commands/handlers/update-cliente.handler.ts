import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { I18nService } from 'nestjs-i18n';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateClienteCommand } from '../impl/update-cliente.command';
import { Cliente } from '../../models/cliente.model';

@CommandHandler(UpdateClienteCommand)
export class UpdateClienteHandler implements ICommandHandler<UpdateClienteCommand> {
  constructor(
    @InjectModel(Cliente)
    private readonly clienteModel: typeof Cliente,
    private readonly i18n: I18nService,
  ) { }

  async execute(command: UpdateClienteCommand): Promise<Cliente> {
    const { tenantId, id, data } = command;

    const cliente = await this.clienteModel.findOne({ where: { id, tenantId } });

    if (!cliente) {
      throw new NotFoundException(await this.i18n.translate('cliente.notFound'));
    }

    const updateData: any = {
      ...(data.nome && { nome: data.nome }),
      ...(data.email && { email: data.email }),
      ...(data.telefone && { telefone: data.telefone }),
      ...(data.isAtivo !== undefined && { isAtivo: data.isAtivo }),
      ...(data.dtNascimento && { dtNascimento: data.dtNascimento }),
      ...(data.documento && { documento: data.documento }),
      ...(data.tipoCliente && { tipoCliente: data.tipoCliente }),
      ...(data.observacoes && { observacoes: data.observacoes }),
      ...(data.tipoPessoa && { tipoPessoa: data.tipoPessoa }),
      ...(data.chatId && { chatId: data.chatId }),
      ...(data.origem !== undefined && { origem: data.origem }),
      ...(data.interesse !== undefined && { interesse: data.interesse }),
      ...(data.pipelineStage !== undefined && { pipelineStage: data.pipelineStage }),
      ...(data.temperatura !== undefined && { temperatura: data.temperatura }),
    };

    try {
      // Check if email is being updated and if it's already taken
      if (data.email && data.email !== cliente.email) {
        const existingEmail = await this.clienteModel.findOne({
          where: { email: data.email, tenantId },
        });
        if (existingEmail) {
          throw new BadRequestException('Email já cadastrado');
        }
      }

      // Check if telefone is being updated and if it's already taken
      if (data.telefone && data.telefone !== cliente.telefone) {
        const existingTelefone = await this.clienteModel.findOne({
          where: { telefone: data.telefone, tenantId },
        });
        if (existingTelefone) {
          throw new BadRequestException('Telefone já cadastrado');
        }
      }

      await cliente.update(updateData);
      return cliente;

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Capturar erro de validação do Sequelize se passar pelas verificações acima
      if (error.name === 'SequelizeUniqueConstraintError') {
        const fields = error.errors.map(e => e.path).join(', ');
        throw new BadRequestException(`Dados duplicados: ${fields} já existe(m).`);
      }
      throw error;
    }
  }
}
