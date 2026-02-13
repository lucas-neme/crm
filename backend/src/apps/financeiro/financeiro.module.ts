import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HttpModule } from '@nestjs/axios';
import { FinanceiroController } from './controllers/financeiro.controller';
import { FinanceiroService } from './services/financeiro.service';
import { NotificationSchedulerService } from './services/notification-scheduler.service';
import { ContaPagar } from './models/conta-pagar.model';
import { ContaReceber } from './models/conta-receber.model';

@Module({
    imports: [
        SequelizeModule.forFeature([ContaPagar, ContaReceber]),
        HttpModule,
    ],
    controllers: [FinanceiroController],
    providers: [FinanceiroService, NotificationSchedulerService],
    exports: [FinanceiroService],
})
export class FinanceiroModule { }

