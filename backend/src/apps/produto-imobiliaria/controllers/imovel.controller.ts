import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ImovelService } from '../services/imovel.service';
import { getTenantId } from '@/common/tenant/tenant-request.util';

@ApiTags('imoveis')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('imoveis')
export class ImovelController {
  constructor(private readonly imovelService: ImovelService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os imoveis' })
  findAll(@Request() req: any) {
    const tenantId = getTenantId(req);
    return this.imovelService.findAll(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar um novo imovel' })
  create(@Request() req: any, @Body() data: any) {
    const tenantId = getTenantId(req);
    return this.imovelService.create(tenantId, data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar imovel por ID' })
  findOne(@Request() req: any, @Param('id') id: string) {
    const tenantId = getTenantId(req);
    return this.imovelService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar imovel' })
  update(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    const tenantId = getTenantId(req);
    return this.imovelService.update(tenantId, id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir imovel' })
  remove(@Request() req: any, @Param('id') id: string) {
    const tenantId = getTenantId(req);
    return this.imovelService.remove(tenantId, id);
  }
}
