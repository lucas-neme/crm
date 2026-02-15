import { Controller, Get, Post, Put, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { PropostaService } from '../services/proposta.service';
import { getTenantId } from '@/common/tenant/tenant-request.util';

@ApiTags('propostas')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('propostas')
export class PropostaController {
    constructor(private readonly service: PropostaService) { }

    @Post()
    @ApiOperation({ summary: 'Criar uma nova proposta' })
    async create(@Request() req: any, @Body() body: any) {
        const tenantId = getTenantId(req);
        return this.service.create(tenantId, body);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas as propostas' })
    async findAll(@Request() req: any, @Query() query: any) {
        const tenantId = getTenantId(req);
        return this.service.findAll(tenantId, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar proposta por ID' })
    async findOne(@Request() req: any, @Param('id') id: string) {
        const tenantId = getTenantId(req);
        return this.service.findOne(tenantId, id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar proposta' })
    async update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
        const tenantId = getTenantId(req);
        return this.service.update(tenantId, id, body);
    }
}
