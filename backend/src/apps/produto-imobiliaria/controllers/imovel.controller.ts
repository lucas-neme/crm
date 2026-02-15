import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ImovelService } from '../services/imovel.service';

@ApiTags('imoveis')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('imoveis')
export class ImovelController {
    constructor(private readonly imovelService: ImovelService) { }

    @Get()
    @ApiOperation({ summary: 'Listar todos os imóveis' })
    findAll(@Request() req: any) {
        return this.imovelService.findAll(req.user?.tenantId || 'default');
    }

    @Post()
    @ApiOperation({ summary: 'Criar um novo imóvel' })
    create(@Request() req: any, @Body() data: any) {
        return this.imovelService.create(req.user?.tenantId || 'default', data);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar imóvel por ID' })
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.imovelService.findOne(req.user?.tenantId || 'default', id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar imóvel' })
    update(@Request() req: any, @Param('id') id: string, @Body() data: any) {
        return this.imovelService.update(req.user?.tenantId || 'default', id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Excluir imóvel' })
    remove(@Request() req: any, @Param('id') id: string) {
        return this.imovelService.remove(req.user?.tenantId || 'default', id);
    }
}
