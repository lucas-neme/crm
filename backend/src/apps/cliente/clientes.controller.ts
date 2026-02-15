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
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { AuthGuard } from '@nestjs/passport';
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
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
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
  async create(@Request() req: any, @Body() createClienteDto: CreateClienteDto): Promise<BaseResponse<Cliente>> {
    const tenantId = req.user?.tenantId || 'default';
    const cliente = await this.commandBus.execute(
      new CreateClienteCommand(tenantId, createClienteDto),
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
  async findAll(@Request() req: any): Promise<BaseResponse<Cliente[]>> {
    const tenantId = req.user?.tenantId || 'default';
    const clientes = await this.queryBus.execute(new GetAllClientesQuery(tenantId));

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
  async findOne(@Request() req: any, @Param('id') id: string): Promise<BaseResponse<Cliente>> {
    const tenantId = req.user?.tenantId || 'default';
    const cliente = await this.queryBus.execute(new GetClienteByIdQuery(tenantId, id));

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
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateClienteDto: UpdateClienteDto,
  ): Promise<BaseResponse<Cliente>> {
    const tenantId = req.user?.tenantId || 'default';
    const cliente = await this.commandBus.execute(
      new UpdateClienteCommand(tenantId, id, updateClienteDto),
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
  async remove(@Request() req: any, @Param('id') id: string): Promise<BaseResponse<boolean>> {
    const tenantId = req.user?.tenantId || 'default';
    await this.commandBus.execute(new DeleteClienteCommand(tenantId, id));

    return {
      success: true,
      data: true,
      message: await this.i18n.translate('cliente.deleted'),
    };
  }

  @Get(':id/enderecos')
  @ApiOperation({ summary: 'Listar endereços de um cliente' })
  async findEnderecos(@Request() req: any, @Param('id') id: string) {
    const tenantId = req.user?.tenantId || 'default';
    const client = await this.queryBus.execute(new GetClienteByIdQuery(tenantId, id));
    if (!client) return { success: false, message: 'Cliente não encontrado' };

    const addresses = await this.enderecoModel.findAll({
      where: { clienteId: id, tenantId }
    });

    // Incluir endereço principal na lista se não estiver lá
    if (client.enderecoId) {
      const mainAddr = await this.enderecoModel.findOne({ where: { id: client.enderecoId, tenantId } });
      if (mainAddr && !addresses.find(a => a.id === mainAddr.id)) {
        addresses.unshift(mainAddr);
      }
    }

    return { success: true, data: addresses };
  }

  @Post(':id/enderecos')
  @ApiOperation({ summary: 'Adicionar endereço a um cliente' })
  async addEndereco(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    const tenantId = req.user?.tenantId || 'default';
    if (data.isPreferencial) {
      // Desmarcar outros preferenciais do cliente
      await this.enderecoModel.update(
        { isPreferencial: false },
        { where: { clienteId: id, tenantId } }
      );
    }
    const address = await this.enderecoModel.create({
      ...data,
      tenantId,
      clienteId: id
    });
    return { success: true, data: address };
  }

  @Put(':id/enderecos/:addrId')
  @ApiOperation({ summary: 'Atualizar endereço de um cliente' })
  async updateEndereco(@Request() req: any, @Param('id') id: string, @Param('addrId') addrId: string, @Body() data: any) {
    const tenantId = req.user?.tenantId || 'default';
    if (data.isPreferencial) {
      await this.enderecoModel.update(
        { isPreferencial: false },
        { where: { clienteId: id, tenantId } }
      );
    }
    await this.enderecoModel.update(data, { where: { id: addrId, clienteId: id, tenantId } });
    const address = await this.enderecoModel.findOne({ where: { id: addrId, tenantId } });
    return { success: true, data: address };
  }

  @Delete(':id/enderecos/:addrId')
  @ApiOperation({ summary: 'Remover endereço de um cliente' })
  async deleteEndereco(@Request() req: any, @Param('id') id: string, @Param('addrId') addrId: string) {
    const tenantId = req.user?.tenantId || 'default';
    await this.enderecoModel.destroy({ where: { id: addrId, clienteId: id, tenantId } });
    return { success: true };
  }
}
