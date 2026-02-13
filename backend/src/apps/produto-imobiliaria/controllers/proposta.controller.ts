import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PropostaService } from '../services/proposta.service';
import { Proposta } from '../models/proposta.model';

@Controller('propostas')
export class PropostaController {
    constructor(private readonly service: PropostaService) { }

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
}
