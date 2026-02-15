import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { UnidadeService } from '../services/unidade.service';
import { getTenantId } from '@/common/tenant/tenant-request.util';

@ApiTags('unidades')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('unidades')
export class UnidadeController {
    constructor(private readonly service: UnidadeService) { }

    @Post()
    @ApiOperation({ summary: 'Criar uma nova unidade' })
    async create(@Request() req: any, @Body() body: any) {
        const tenantId = getTenantId(req);
        return this.service.create(tenantId, body);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas as unidades' })
    async findAll(@Request() req: any, @Query() query: any) {
        const tenantId = getTenantId(req);
        return this.service.findAll(tenantId, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar unidade por ID' })
    async findOne(@Request() req: any, @Param('id') id: string) {
        const tenantId = getTenantId(req);
        return this.service.findOne(tenantId, id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar unidade' })
    async update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
        const tenantId = getTenantId(req);
        return this.service.update(tenantId, id, body);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Excluir unidade' })
    async remove(@Request() req: any, @Param('id') id: string) {
        const tenantId = getTenantId(req);
        return this.service.remove(tenantId, id);
    }
}
