import { Controller, Get, Post, Body, Param, Put, UseGuards, Patch, Request } from '@nestjs/common';
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
    @ApiOperation({ summary: 'Criar Conta a Pagar' })
    createPagar(@Request() req: any, @Body() dto: CreateContaDto) {
        const tenantId = req.user?.tenantId || 'default';
        return this.financeiroService.createPagar(tenantId, dto);
    }

    @Get('pagar')
    @ApiOperation({ summary: 'Listar Contas a Pagar' })
    findAllPagar(@Request() req: any) {
        const tenantId = req.user?.tenantId || 'default';
        return this.financeiroService.findAllPagar(tenantId);
    }

    @Patch('pagar/:id/pay')
    @ApiOperation({ summary: 'Marcar Conta a Pagar como PAGA' })
    markAsPaid(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.user?.tenantId || 'default';
        return this.financeiroService.updatePagar(tenantId, id, { status: 'PAGO' as any, dtPagamento: new Date().toISOString().split('T')[0] });
    }

    // --- Contas a Receber ---
    @Post('receber')
    @ApiOperation({ summary: 'Criar Conta a Receber' })
    createReceber(@Request() req: any, @Body() dto: CreateContaDto) {
        const tenantId = req.user?.tenantId || 'default';
        return this.financeiroService.createReceber(tenantId, dto);
    }

    @Get('receber')
    @ApiOperation({ summary: 'Listar Contas a Receber' })
    findAllReceber(@Request() req: any) {
        const tenantId = req.user?.tenantId || 'default';
        return this.financeiroService.findAllReceber(tenantId);
    }

    @Patch('receber/:id/receive')
    @ApiOperation({ summary: 'Marcar Conta a Receber como PAGA (Recebido)' })
    markAsReceived(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.user?.tenantId || 'default';
        return this.financeiroService.updateReceber(tenantId, id, { status: 'PAGO' as any, dtRecebimento: new Date().toISOString().split('T')[0] });
    }

    @Post('receber/:id/notify')
    @ApiOperation({ summary: 'Acionar manualmente notificação de cobrança (n8n)' })
    async triggerNotification(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.user?.tenantId || 'default';
        const conta = await this.financeiroService.findOneReceber(tenantId, id);
        if (conta) {
            await this.financeiroService.triggerBillingNotification(conta);
            return { message: 'Notification triggered' };
        }
        return { message: 'Conta not found' };
    }

    @Patch('receber/:id')
    @ApiOperation({ summary: 'Atualizar Conta a Receber' })
    updateReceber(@Request() req: any, @Param('id') id: string, @Body() dto: Partial<CreateContaDto>) {
        const tenantId = req.user?.tenantId || 'default';
        return this.financeiroService.updateReceber(tenantId, id, dto as any);
    }
}
