import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { EmpreendimentoService } from '../services/empreendimento.service';
import { Empreendimento } from '../models/empreendimento.model';

@Controller('empreendimentos')
export class EmpreendimentoController {
    constructor(private readonly service: EmpreendimentoService) { }

    @Post()
    async create(@Body() body: Partial<Empreendimento>) {
        return this.service.create(body);
    }

    @Get()
    async findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() body: Partial<Empreendimento>) {
        return this.service.update(id, body);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
