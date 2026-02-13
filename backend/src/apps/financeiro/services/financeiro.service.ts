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
    async createPagar(dto: CreateContaDto): Promise<ContaPagar> {
        const conta = await this.contaPagarModel.create({
            ...dto,
            status: StatusConta.PENDENTE,
        });
        this.triggerPowerBiSync(conta, 'PAGAR', 'CREATE');
        return conta;
    }

    async findAllPagar() {
        return this.contaPagarModel.findAll();
    }

    async updatePagar(id: string, updates: Partial<ContaPagar>) {
        const conta = await this.contaPagarModel.findByPk(id);
        if (!conta) return null;
        const updated = await conta.update(updates);
        this.triggerPowerBiSync(updated, 'PAGAR', 'UPDATE');
        return updated;
    }

    // --- Contas a Receber ---
    async createReceber(dto: CreateContaDto): Promise<ContaReceber> {
        const conta = await this.contaReceberModel.create({
            ...dto,
            status: StatusConta.PENDENTE,
        });

        // Trigger n8n webhook for billing notification (Reload to get client data)
        const contaComCliente = await this.findOneReceber(conta.id);
        if (contaComCliente) {
            this.triggerBillingNotification(contaComCliente);
        }

        this.triggerPowerBiSync(conta, 'RECEBER', 'CREATE');

        return conta;
    }

    async findAllReceber() {
        return this.contaReceberModel.findAll({ include: ['cliente'] });
    }

    async findOneReceber(id: string) {
        return this.contaReceberModel.findByPk(id, { include: ['cliente'] });
    }

    async updateReceber(id: string, updates: Partial<ContaReceber>) {
        const conta = await this.contaReceberModel.findByPk(id);
        if (!conta) return null;
        const updated = await conta.update(updates);
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
