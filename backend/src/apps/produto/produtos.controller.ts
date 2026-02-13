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
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { CreateProdutoCommand } from './commands/impl/create-produto.command';
import { UpdateProdutoCommand } from './commands/impl/update-produto.command';
import { DeleteProdutoCommand } from './commands/impl/delete-produto.command';
import { GetAllProdutosQuery } from './queries/impl/get-all-produtos.query';
import { GetProdutoByIdQuery } from './queries/impl/get-produto-by-id.query';
import { BaseResponse } from '@/common/interfaces/base-response.interface';
import { Produto } from './models/produto.model';

@ApiTags('produtos')
@Controller('produtos')
export class ProdutosController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo produto' })
  @ApiResponse({
    status: 201,
    description: 'Produto criado com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createProdutoDto: CreateProdutoDto): Promise<BaseResponse<Produto>> {
    const produto = await this.commandBus.execute(
      new CreateProdutoCommand(createProdutoDto),
    );

    return {
      success: true,
      data: produto,
      message: await this.i18n.translate('produto.created'),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos',
  })
  async findAll(): Promise<BaseResponse<Produto[]>> {
    const produtos = await this.queryBus.execute(new GetAllProdutosQuery());

    return {
      success: true,
      data: produtos,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produto por ID' })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  @ApiResponse({
    status: 200,
    description: 'Produto encontrado',
  })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async findOne(@Param('id') id: string): Promise<BaseResponse<Produto>> {
    const produto = await this.queryBus.execute(new GetProdutoByIdQuery(id));

    return {
      success: true,
      data: produto,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar produto' })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  @ApiResponse({
    status: 200,
    description: 'Produto atualizado com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateProdutoDto: UpdateProdutoDto,
  ): Promise<BaseResponse<Produto>> {
    const produto = await this.commandBus.execute(
      new UpdateProdutoCommand(id, updateProdutoDto),
    );

    return {
      success: true,
      data: produto,
      message: await this.i18n.translate('produto.updated'),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Excluir produto' })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  @ApiResponse({
    status: 200,
    description: 'Produto excluído com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async remove(@Param('id') id: string): Promise<BaseResponse<boolean>> {
    await this.commandBus.execute(new DeleteProdutoCommand(id));

    return {
      success: true,
      data: true,
      message: await this.i18n.translate('produto.deleted'),
    };
  }
}
