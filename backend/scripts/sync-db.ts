import 'dotenv/config';
import { Sequelize } from 'sequelize-typescript';

import { Endereco } from '../src/common/models/endereco.model';
import { Cliente } from '../src/apps/cliente/models/cliente.model';
import { Documento } from '../src/apps/cliente/models/documento.model';
import { Produto } from '../src/apps/produto/models/produto.model';
import { Negocio } from '../src/apps/negocio/models/negocio.model';
import { NegocioProduto } from '../src/apps/negocio/models/negocio-produto.model';
import { User } from '../src/apps/auth/models/user.model';
import { ContaPagar } from '../src/apps/financeiro/models/conta-pagar.model';
import { ContaReceber } from '../src/apps/financeiro/models/conta-receber.model';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'Davi_123',
  database: process.env.DB_DATABASE || 'crm',
  logging: console.log,
  models: [
    Endereco,
    Documento,
    Cliente,
    Produto,
    Negocio,
    NegocioProduto,
    User,
    ContaPagar,
    ContaReceber,
  ],
});

async function main() {
  console.log('Conectando ao banco:', process.env.DB_HOST, process.env.DB_PORT, process.env.DB_DATABASE);
  await sequelize.sync({ force: true });
  await sequelize.close();
  console.log('Tabelas recriadas com sucesso!');
}

main().catch((error) => {
  console.error('Falha ao recriar tabelas:', error);
  process.exit(1);
});
