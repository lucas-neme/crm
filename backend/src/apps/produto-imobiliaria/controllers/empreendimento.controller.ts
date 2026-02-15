import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmpreendimentoService } from '../services/empreendimento.service';
import { Empreendimento } from '../models/empreendimento.model';

@ApiTags('empreendimentos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('empreendimentos')
export class EmpreendimentoController {
    constructor(private readonly service: EmpreendimentoService) { }

    @Post()
    @ApiOperation({ summary: 'Criar um novo empreendimento' })
    async create(@Request() req: any, @Body() body: Partial<Empreendimento>) {
        return this.service.create(req.user?.tenantId || 'default', body);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos os empreendimentos' })
    async findAll(@Request() req: any) {
        return this.service.findAll(req.user?.tenantId || 'default');
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar empreendimento por ID' })
    async findOne(@Request() req: any, @Param('id') id: string) {
        return this.service.findOne(req.user?.tenantId || 'default', id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar empreendimento' })
    async update(@Request() req: any, @Param('id') id: string, @Body() body: Partial<Empreendimento>) {
        return this.service.update(req.user?.tenantId || 'default', id, body);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Excluir empreendimento' })
    async remove(@Request() req: any, @Param('id') id: string) {
        return this.service.remove(req.user?.tenantId || 'default', id);
    }
}
