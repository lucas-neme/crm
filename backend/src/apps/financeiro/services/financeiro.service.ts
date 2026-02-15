import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HttpService } from '@nestjs/axios';
import { ContaPagar, StatusConta } from '../models/conta-pagar.model';
import { ContaReceber } from '../models/conta-receber.model';
import { CreateContaDto } from '../dto/create-conta.dto';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FinanceiroService {
    private readonly logger = new Logger(FinanceiroService.name);

    constructor(
        @InjectModel(ContaPagar)
        private contaPagarModel: typeof ContaPagar,
        @InjectModel(ContaReceber)
        private contaReceberModel: typeof ContaReceber,
        private httpService: HttpService,
        private configService: ConfigService,
    ) { }

    // --- Contas a Pagar ---
    async createPagar(tenantId: string, dto: CreateContaDto): Promise<ContaPagar> {
        const conta = await this.contaPagarModel.create({
            ...dto,
            tenantId,
            status: StatusConta.PENDENTE,
        });
        this.triggerPowerBiSync(conta, 'PAGAR', 'CREATE');
        return conta;
    }

    async findAllPagar(tenantId: string) {
        return this.contaPagarModel.findAll({ where: { tenantId } });
    }

    async updatePagar(tenantId: string, id: string, updates: Partial<ContaPagar>) {
        const conta = await this.contaPagarModel.findOne({ where: { id, tenantId } });
        if (!conta) return null;
        const { tenantId: _tenantId, tenant_id: _tenantIdSnake, ...safeUpdates } = (updates || {}) as any;
        const updated = await conta.update(safeUpdates);
        this.triggerPowerBiSync(updated, 'PAGAR', 'UPDATE');
        return updated;
    }

    // --- Contas a Receber ---
    async createReceber(tenantId: string, dto: CreateContaDto): Promise<ContaReceber> {
        const conta = await this.contaReceberModel.create({
            ...dto,
            tenantId,
            status: StatusConta.PENDENTE,
        });

        // Trigger n8n webhook for billing notification (Reload to get client data)
        const contaComCliente = await this.findOneReceber(tenantId, conta.id);
        if (contaComCliente) {
            this.triggerBillingNotification(contaComCliente);
        }

        this.triggerPowerBiSync(conta, 'RECEBER', 'CREATE');

        return conta;
    }

    async findAllReceber(tenantId: string) {
        return this.contaReceberModel.findAll({ where: { tenantId }, include: ['cliente'] });
    }

    async findOneReceber(tenantId: string, id: string) {
        return this.contaReceberModel.findOne({ where: { id, tenantId }, include: ['cliente'] });
    }

    async updateReceber(tenantId: string, id: string, updates: Partial<ContaReceber>) {
        const conta = await this.contaReceberModel.findOne({ where: { id, tenantId } });
        if (!conta) return null;
        const { tenantId: _tenantId, tenant_id: _tenantIdSnake, ...safeUpdates } = (updates || {}) as any;
        const updated = await conta.update(safeUpdates);
        this.triggerPowerBiSync(updated, 'RECEBER', 'UPDATE');
        return updated;
    }

    // --- n8n Integration ---
    async triggerBillingNotification(conta: ContaReceber) {
        const webhookUrl = this.configService.get<string>('N8N_BILLING_WEBHOOK_URL');
        if (!webhookUrl) return;

        try {
            this.logger.log(`Triggering billing notification for conta ${conta.id}`);
            await lastValueFrom(
                this.httpService.post(webhookUrl, {
                    contaId: conta.id,
                    valor: conta.valor,
                    descricao: conta.descricao,
                    vencimento: conta.dtVencimento,
                    clienteEmail: conta.cliente?.email || null,
                    clienteTelefone: conta.cliente?.telefone || null,
                    clienteNome: conta.cliente?.nome || null,
                })
            );
        } catch (error) {
            this.logger.error('Failed to trigger billing notification', error);
        }
    }

    async triggerPowerBiSync(data: any, type: 'PAGAR' | 'RECEBER', action: 'CREATE' | 'UPDATE') {
        const webhookUrl = this.configService.get<string>('N8N_POWERBI_WEBHOOK_URL');
        if (!webhookUrl) return;

        try {
            this.logger.log(`Triggering Power BI Sync for ${type} - ${action}`);
            // Send async to avoid blocking
            lastValueFrom(
                this.httpService.post(webhookUrl, {
                    eventType: action,
                    dataType: type,
                    timestamp: new Date().toISOString(),
                    data: data
                })
            ).catch(err => this.logger.error('Failed to sync with Power BI', err));
        } catch (error) {
            this.logger.error('Failed to trigger Power BI sync', error);
        }
    }
}
