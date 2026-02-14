import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

async function fix() {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'Davi_123',
    database: process.env.DB_DATABASE || 'crm',
    logging: console.log,
  });

  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    await sequelize.query('ALTER TABLE "configuracoes" ALTER COLUMN "valor" TYPE TEXT');
    console.log('Column "valor" altered to TEXT successfully.');
  } catch (error) {
    console.error('Unable to fix the database:', error);
  } finally {
    await sequelize.close();
  }
}

fix();
