import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { I18nService } from 'nestjs-i18n';
import { BadRequestException } from '@nestjs/common';
import { CreateClienteCommand } from '../impl/create-cliente.command';
import { Cliente } from '../../models/cliente.model';

@CommandHandler(CreateClienteCommand)
export class CreateClienteHandler implements ICommandHandler<CreateClienteCommand> {
  constructor(
    @InjectModel(Cliente)
    private readonly clienteModel: typeof Cliente,
    private readonly i18n: I18nService,
  ) { }

  async execute(command: CreateClienteCommand): Promise<Cliente> {
    const { tenantId, data } = command;

    // Check if cliente already exists
    const existingCliente = await this.clienteModel.findOne({
      where: { email: data.email, tenantId },
    });

    if (existingCliente) {
      throw new BadRequestException(
        await this.i18n.translate('cliente.alreadyExists'),
      );
    }

    // Check if telefone already exists
    const existingTelefone = await this.clienteModel.findOne({
      where: { telefone: data.telefone, tenantId },
    });

    if (existingTelefone) {
      throw new BadRequestException('Telefone já cadastrado');
    }

    const ultimoCliente = await this.clienteModel.findOne({
      where: { tenantId },
      order: [['codigo', 'DESC']],
      raw: true,
    });
    const novoCodigo = ultimoCliente && ultimoCliente.codigo ? ultimoCliente.codigo + 1 : 1;

    // Create cliente
    const cliente = await this.clienteModel.create({
      codigo: novoCodigo,
      tenantId,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      tipoPessoa: data.tipoPessoa,
      isAtivo: data.isAtivo ?? true,
      dtNascimento: data.dtNascimento,
      documento: data.documento,
      tipoCliente: data.tipoCliente,
      observacoes: data.observacoes,
      chatId: data.chatId,
      origem: data.origem,
      interesse: data.interesse,
      pipelineStage: data.pipelineStage,
      temperatura: data.temperatura,
    });

    return cliente;
  }
}
