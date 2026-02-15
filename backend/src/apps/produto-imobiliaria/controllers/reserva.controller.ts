import { Controller, Get, Post, Put, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReservaService } from '../services/reserva.service';

@ApiTags('reservas')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reservas')
export class ReservaController {
    constructor(private readonly service: ReservaService) { }

    @Post()
    @ApiOperation({ summary: 'Criar uma nova reserva' })
    async create(@Request() req: any, @Body() body: any) {
        return this.service.create(req.user?.tenantId || 'default', body);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas as reservas' })
    async findAll(@Request() req: any, @Query() query: any) {
        return this.service.findAll(req.user?.tenantId || 'default', query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar reserva por ID' })
    async findOne(@Request() req: any, @Param('id') id: string) {
        return this.service.findOne(req.user?.tenantId || 'default', id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar reserva' })
    async update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
        return this.service.update(req.user?.tenantId || 'default', id, body);
    }

    @Post(':id/cancel')
    @ApiOperation({ summary: 'Cancelar reserva' })
    async cancel(@Request() req: any, @Param('id') id: string) {
        return this.service.cancel(req.user?.tenantId || 'default', id);
    }

    @Post('verify-expired')
    @ApiOperation({ summary: 'Verificar e processar reservas expiradas' })
    async verifyExpired(@Request() req: any) {
        const count = await this.service.verifyExpiredReservations(req.user?.tenantId || 'default');
        return { success: true, expiredProcessed: count };
    }
}
