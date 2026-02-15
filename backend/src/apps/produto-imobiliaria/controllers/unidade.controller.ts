import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { UnidadeService } from '../services/unidade.service';

@ApiTags('unidades')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('unidades')
export class UnidadeController {
    constructor(private readonly service: UnidadeService) { }

    @Post()
    @ApiOperation({ summary: 'Criar uma nova unidade' })
    async create(@Request() req: any, @Body() body: any) {
        return this.service.create(req.user?.tenantId || 'default', body);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas as unidades' })
    async findAll(@Request() req: any, @Query() query: any) {
        return this.service.findAll(req.user?.tenantId || 'default', query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar unidade por ID' })
    async findOne(@Request() req: any, @Param('id') id: string) {
        return this.service.findOne(req.user?.tenantId || 'default', id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar unidade' })
    async update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
        return this.service.update(req.user?.tenantId || 'default', id, body);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Excluir unidade' })
    async remove(@Request() req: any, @Param('id') id: string) {
        return this.service.remove(req.user?.tenantId || 'default', id);
    }
}
