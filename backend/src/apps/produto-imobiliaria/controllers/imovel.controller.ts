import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ImovelService } from '../services/imovel.service';

@Controller('imoveis')
export class ImovelController {
    constructor(private readonly imovelService: ImovelService) { }

    @Get()
    findAll() {
        return this.imovelService.findAll();
    }

    @Post()
    create(@Body() data: any) {
        return this.imovelService.create(data);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.imovelService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.imovelService.update(id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.imovelService.remove(id);
    }
}
