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
import { CreateNegocioDto } from './dto/create-negocio.dto';
import { UpdateNegocioDto } from './dto/update-negocio.dto';
import { CreateNegocioCommand } from './commands/impl/create-negocio.command';
import { UpdateNegocioCommand } from './commands/impl/update-negocio.command';
import { DeleteNegocioCommand } from './commands/impl/delete-negocio.command';
import { GetAllNegociosQuery } from './queries/impl/get-all-negocios.query';
import { GetNegocioByIdQuery } from './queries/impl/get-negocio-by-id.query';
import { BaseResponse } from '@/common/interfaces/base-response.interface';
import { Negocio } from './models/negocio.model';

@ApiTags('negocios')
@Controller('negocios')
export class NegociosController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo negócio' })
  @ApiResponse({
    status: 201,
    description: 'Negócio criado com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createNegocioDto: CreateNegocioDto): Promise<BaseResponse<Negocio>> {
    const negocio = await this.commandBus.execute(
      new CreateNegocioCommand(createNegocioDto),
    );

    return {
      success: true,
      data: negocio,
      message: await this.i18n.translate('negocio.created'),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os negócios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de negócios',
  })
  async findAll(): Promise<BaseResponse<Negocio[]>> {
    const negocios = await this.queryBus.execute(new GetAllNegociosQuery());

    return {
      success: true,
      data: negocios,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar negócio por ID' })
  @ApiParam({ name: 'id', description: 'ID do negócio' })
  @ApiResponse({
    status: 200,
    description: 'Negócio encontrado',
  })
  @ApiResponse({ status: 404, description: 'Negócio não encontrado' })
  async findOne(@Param('id') id: string): Promise<BaseResponse<Negocio>> {
    const negocio = await this.queryBus.execute(new GetNegocioByIdQuery(id));

    return {
      success: true,
      data: negocio,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar negócio' })
  @ApiParam({ name: 'id', description: 'ID do negócio' })
  @ApiResponse({
    status: 200,
    description: 'Negócio atualizado com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Negócio não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateNegocioDto: UpdateNegocioDto,
  ): Promise<BaseResponse<Negocio>> {
    const negocio = await this.commandBus.execute(
      new UpdateNegocioCommand(id, updateNegocioDto),
    );

    return {
      success: true,
      data: negocio,
      message: await this.i18n.translate('negocio.updated'),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Excluir negócio' })
  @ApiParam({ name: 'id', description: 'ID do negócio' })
  @ApiResponse({
    status: 200,
    description: 'Negócio excluído com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Negócio não encontrado' })
  async remove(@Param('id') id: string): Promise<BaseResponse<boolean>> {
    await this.commandBus.execute(new DeleteNegocioCommand(id));

    return {
      success: true,
      data: true,
      message: await this.i18n.translate('negocio.deleted'),
    };
  }
}
