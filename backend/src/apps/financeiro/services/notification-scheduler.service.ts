import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ContaReceber } from '../models/conta-receber.model';
import { StatusConta } from '../models/conta-pagar.model';
import { FinanceiroService } from './financeiro.service';

@Injectable()
export class NotificationSchedulerService {
    private readonly logger = new Logger(NotificationSchedulerService.name);

    constructor(
        @InjectModel(ContaReceber)
        private contaReceberModel: typeof ContaReceber,
        private financeiroService: FinanceiroService,
    ) { }

    // Runs every day at 8:00 AM
    @Cron('0 8 * * *')
    async handleDailyNotifications() {
        this.logger.log('Running daily notification check for accounts due tomorrow...');

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

        try {
            const contasDueTomorrow = await this.contaReceberModel.findAll({
                where: {
                    dataVencimento: tomorrowStr,
                    status: StatusConta.PENDENTE,
                },
                include: ['cliente'],
            });

            this.logger.log(`Found ${contasDueTomorrow.length} accounts due tomorrow (${tomorrowStr})`);

            for (const conta of contasDueTomorrow) {
                try {
                    await this.financeiroService.triggerBillingNotification(conta);
                    this.logger.log(`Notification sent for conta ${conta.id} - ${conta.descricao}`);
                } catch (error) {
                    this.logger.error(`Failed to send notification for conta ${conta.id}`, error);
                }
            }

            this.logger.log('Daily notification check completed.');
        } catch (error) {
            this.logger.error('Error during daily notification check', error);
        }
    }
}
