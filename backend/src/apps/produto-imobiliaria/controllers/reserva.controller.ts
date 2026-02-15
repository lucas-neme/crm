import { Controller, Get, Post, Put, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReservaService } from '../services/reserva.service';
import { getTenantId } from '@/common/tenant/tenant-request.util';

@ApiTags('reservas')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reservas')
export class ReservaController {
    constructor(private readonly service: ReservaService) { }

    @Post()
    @ApiOperation({ summary: 'Criar uma nova reserva' })
    async create(@Request() req: any, @Body() body: any) {
        const tenantId = getTenantId(req);
        return this.service.create(tenantId, body);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas as reservas' })
    async findAll(@Request() req: any, @Query() query: any) {
        const tenantId = getTenantId(req);
        return this.service.findAll(tenantId, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar reserva por ID' })
    async findOne(@Request() req: any, @Param('id') id: string) {
        const tenantId = getTenantId(req);
        return this.service.findOne(tenantId, id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar reserva' })
    async update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
        const tenantId = getTenantId(req);
        return this.service.update(tenantId, id, body);
    }

    @Post(':id/cancel')
    @ApiOperation({ summary: 'Cancelar reserva' })
    async cancel(@Request() req: any, @Param('id') id: string) {
        const tenantId = getTenantId(req);
        return this.service.cancel(tenantId, id);
    }

    @Post('verify-expired')
    @ApiOperation({ summary: 'Verificar e processar reservas expiradas' })
    async verifyExpired(@Request() req: any) {
        const tenantId = getTenantId(req);
        const count = await this.service.verifyExpiredReservations(tenantId);
        return { success: true, expiredProcessed: count };
    }
}
