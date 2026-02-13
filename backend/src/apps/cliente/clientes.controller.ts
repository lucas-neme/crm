import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { CreateClienteCommand } from './commands/impl/create-cliente.command';
import { UpdateClienteCommand } from './commands/impl/update-cliente.command';
import { DeleteClienteCommand } from './commands/impl/delete-cliente.command';
import { GetAllClientesQuery } from './queries/impl/get-all-clientes.query';
import { GetClienteByIdQuery } from './queries/impl/get-cliente-by-id.query';
import { BaseResponse } from '@/common/interfaces/base-response.interface';
import { Cliente } from './models/cliente.model';
import { Endereco } from '@/common/models/endereco.model';
import { InjectModel } from '@nestjs/sequelize';

@ApiTags('clientes')
@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @InjectModel(Endereco)
    private readonly enderecoModel: typeof Endereco,
    private readonly i18n: I18nService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Criar um novo cliente' })
  @ApiResponse({
    status: 201,
    description: 'Cliente criado com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createClienteDto: CreateClienteDto): Promise<BaseResponse<Cliente>> {
    const cliente = await this.commandBus.execute(
      new CreateClienteCommand(createClienteDto),
    );

    return {
      success: true,
      data: cliente,
      message: await this.i18n.translate('cliente.created'),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes',
  })
  async findAll(): Promise<BaseResponse<Cliente[]>> {
    const clientes = await this.queryBus.execute(new GetAllClientesQuery());

    return {
      success: true,
      data: clientes,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado',
  })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async findOne(@Param('id') id: string): Promise<BaseResponse<Cliente>> {
    const cliente = await this.queryBus.execute(new GetClienteByIdQuery(id));

    return {
      success: true,
      data: cliente,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({
    status: 200,
    description: 'Cliente atualizado com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateClienteDto: UpdateClienteDto,
  ): Promise<BaseResponse<Cliente>> {
    const cliente = await this.commandBus.execute(
      new UpdateClienteCommand(id, updateClienteDto),
    );

    return {
      success: true,
      data: cliente,
      message: await this.i18n.translate('cliente.updated'),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Excluir cliente' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({
    status: 200,
    description: 'Cliente excluído com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async remove(@Param('id') id: string): Promise<BaseResponse<boolean>> {
    await this.commandBus.execute(new DeleteClienteCommand(id));

    return {
      success: true,
      data: true,
      message: await this.i18n.translate('cliente.deleted'),
    };
  }

  @Get(':id/enderecos')
  @ApiOperation({ summary: 'Listar endereços de um cliente' })
  async findEnderecos(@Param('id') id: string) {
    const client = await this.queryBus.execute(new GetClienteByIdQuery(id));
    if (!client) return { success: false, message: 'Cliente não encontrado' };

    const addresses = await this.enderecoModel.findAll({
      where: { clienteId: id }
    });

    // Incluir endereço principal na lista se não estiver lá
    if (client.enderecoId) {
      const mainAddr = await this.enderecoModel.findByPk(client.enderecoId);
      if (mainAddr && !addresses.find(a => a.id === mainAddr.id)) {
        addresses.unshift(mainAddr);
      }
    }

    return { success: true, data: addresses };
  }

  @Post(':id/enderecos')
  @ApiOperation({ summary: 'Adicionar endereço a um cliente' })
  async addEndereco(@Param('id') id: string, @Body() data: any) {
    if (data.isPreferencial) {
      // Desmarcar outros preferenciais do cliente
      await this.enderecoModel.update(
        { isPreferencial: false },
        { where: { clienteId: id } }
      );
    }
    const address = await this.enderecoModel.create({
      ...data,
      clienteId: id
    });
    return { success: true, data: address };
  }

  @Put(':id/enderecos/:addrId')
  @ApiOperation({ summary: 'Atualizar endereço de um cliente' })
  async updateEndereco(@Param('id') id: string, @Param('addrId') addrId: string, @Body() data: any) {
    if (data.isPreferencial) {
      await this.enderecoModel.update(
        { isPreferencial: false },
        { where: { clienteId: id } }
      );
    }
    await this.enderecoModel.update(data, { where: { id: addrId, clienteId: id } });
    const address = await this.enderecoModel.findByPk(addrId);
    return { success: true, data: address };
  }

  @Delete(':id/enderecos/:addrId')
  @ApiOperation({ summary: 'Remover endereço de um cliente' })
  async deleteEndereco(@Param('id') id: string, @Param('addrId') addrId: string) {
    await this.enderecoModel.destroy({ where: { id: addrId, clienteId: id } });
    return { success: true };
  }
}
