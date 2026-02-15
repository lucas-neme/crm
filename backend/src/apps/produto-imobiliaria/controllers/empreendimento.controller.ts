import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmpreendimentoService } from '../services/empreendimento.service';
import { Empreendimento } from '../models/empreendimento.model';
import { getTenantId } from '@/common/tenant/tenant-request.util';

@ApiTags('empreendimentos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('empreendimentos')
export class EmpreendimentoController {
    constructor(private readonly service: EmpreendimentoService) { }

    @Post()
    @ApiOperation({ summary: 'Criar um novo empreendimento' })
    async create(@Request() req: any, @Body() body: Partial<Empreendimento>) {
        const tenantId = getTenantId(req);
        return this.service.create(tenantId, body);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos os empreendimentos' })
    async findAll(@Request() req: any) {
        const tenantId = getTenantId(req);
        return this.service.findAll(tenantId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar empreendimento por ID' })
    async findOne(@Request() req: any, @Param('id') id: string) {
        const tenantId = getTenantId(req);
        return this.service.findOne(tenantId, id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar empreendimento' })
    async update(@Request() req: any, @Param('id') id: string, @Body() body: Partial<Empreendimento>) {
        const tenantId = getTenantId(req);
        return this.service.update(tenantId, id, body);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Excluir empreendimento' })
    async remove(@Request() req: any, @Param('id') id: string) {
        const tenantId = getTenantId(req);
        return this.service.remove(tenantId, id);
    }
}
