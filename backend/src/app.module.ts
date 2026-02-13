import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ScheduleModule } from '@nestjs/schedule';
import { I18nModule, AcceptLanguageResolver, QueryResolver } from 'nestjs-i18n';
import { join } from 'path';
import { ClientesModule } from './apps/cliente/clientes.module';
import { ProdutosModule } from './apps/produto/produtos.module';
import { NegociosModule } from './apps/negocio/negocios.module';
import { IntegrationsModule } from './apps/integrations/integrations.module';
import { AuthModule } from './apps/auth/auth.module';
import { FinanceiroModule } from './apps/financeiro/financeiro.module';
import { ConfiguracoesModule } from './apps/configuracoes/configuracoes.module';
import { ImovelModule } from './apps/produto-imobiliaria/imovel.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Scheduler
    ScheduleModule.forRoot(),

    // Database
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'Davi_123',
      database: process.env.DB_DATABASE || 'crm',
      autoLoadModels: true,
      synchronize: false,
      logging: console.log,
    }),

    // i18n
    I18nModule.forRoot({
      fallbackLanguage: 'pt',
      loaderOptions: {
        path: join(__dirname, '../i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),

    // Feature modules
    ClientesModule,
    ProdutosModule,
    NegociosModule,
    IntegrationsModule,
    AuthModule,
    FinanceiroModule,
    ConfiguracoesModule,
    ImovelModule,
  ],
})
export class AppModule { }
