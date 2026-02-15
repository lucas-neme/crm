import { Controller, Get, Post, Put, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { PropostaService } from '../services/proposta.service';

@ApiTags('propostas')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('propostas')
export class PropostaController {
    constructor(private readonly service: PropostaService) { }

    @Post()
    @ApiOperation({ summary: 'Criar uma nova proposta' })
    async create(@Request() req: any, @Body() body: any) {
        return this.service.create(req.user?.tenantId || 'default', body);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas as propostas' })
    async findAll(@Request() req: any, @Query() query: any) {
        return this.service.findAll(req.user?.tenantId || 'default', query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar proposta por ID' })
    async findOne(@Request() req: any, @Param('id') id: string) {
        return this.service.findOne(req.user?.tenantId || 'default', id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar proposta' })
    async update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
        return this.service.update(req.user?.tenantId || 'default', id, body);
    }
}
