import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ReservaService } from '../services/reserva.service';
import { Reserva } from '../models/reserva.model';

@Controller('reservas')
export class ReservaController {
    constructor(private readonly service: ReservaService) { }

    @Post()
    async create(@Body() body: any) {
        // If unit is available etc logic in service
        return this.service.create(body);
    }

    @Get()
    async findAll(@Query() query: any) {
        return this.service.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.service.update(id, body);
    }

    @Post(':id/cancel')
    async cancel(@Param('id') id: string) {
        return this.service.cancel(id);
    }

    @Post('verify-expired')
    async verifyExpired() {
        const count = await this.service.verifyExpiredReservations();
        return { success: true, expiredProcessed: count };
    }
}
