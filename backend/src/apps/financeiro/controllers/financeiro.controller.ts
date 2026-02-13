import { Controller, Get, Post, Body, Param, Put, UseGuards, Patch } from '@nestjs/common';
import { FinanceiroService } from '../services/financeiro.service';
import { CreateContaDto } from '../dto/create-conta.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('financeiro')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('financeiro')
export class FinanceiroController {
    constructor(private readonly financeiroService: FinanceiroService) { }

    // --- Contas a Pagar ---
    @Post('pagar')
    @ApiOperation({ summary: 'Create Conta a Pagar' })
    createPagar(@Body() dto: CreateContaDto) {
        return this.financeiroService.createPagar(dto);
    }

    @Get('pagar')
    @ApiOperation({ summary: 'List Contas a Pagar' })
    findAllPagar() {
        return this.financeiroService.findAllPagar();
    }

    @Patch('pagar/:id/pay')
    @ApiOperation({ summary: 'Mark Conta a Pagar as PAID' })
    markAsPaid(@Param('id') id: string) {
        return this.financeiroService.updatePagar(id, { status: 'PAGO' as any, dtPagamento: new Date().toISOString().split('T')[0] });
    }

    // --- Contas a Receber ---
    @Post('receber')
    @ApiOperation({ summary: 'Create Conta a Receber' })
    createReceber(@Body() dto: CreateContaDto) {
        return this.financeiroService.createReceber(dto);
    }

    @Get('receber')
    @ApiOperation({ summary: 'List Contas a Receber' })
    findAllReceber() {
        return this.financeiroService.findAllReceber();
    }

    @Patch('receber/:id/receive')
    @ApiOperation({ summary: 'Mark Conta a Receber as PAID (Received)' })
    markAsReceived(@Param('id') id: string) {
        return this.financeiroService.updateReceber(id, { status: 'PAGO' as any, dtRecebimento: new Date().toISOString().split('T')[0] });
    }

    @Post('receber/:id/notify')
    @ApiOperation({ summary: 'Manually trigger billing notification (n8n)' })
    async triggerNotification(@Param('id') id: string) {
        const conta = await this.financeiroService.findOneReceber(id);
        if (conta) {
            await this.financeiroService.triggerBillingNotification(conta);
            return { message: 'Notification triggered' };
        }
        return { message: 'Conta not found' };
    }

    @Patch('receber/:id')
    @ApiOperation({ summary: 'Update Conta a Receber' })
    updateReceber(@Param('id') id: string, @Body() dto: Partial<CreateContaDto>) {
        return this.financeiroService.updateReceber(id, dto as any);
    }
}
