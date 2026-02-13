import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { UnidadeService } from '../services/unidade.service';
import { Unidade } from '../models/unidade.model';

@Controller('unidades')
export class UnidadeController {
    constructor(private readonly service: UnidadeService) { }

    @Post()
    async create(@Body() body: any) {
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

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
