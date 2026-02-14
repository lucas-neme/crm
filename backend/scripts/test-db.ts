import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

async function test() {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'Davi_123',
    database: process.env.DB_DATABASE || 'crm',
    logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    const [results] = await sequelize.query('SELECT count(*) as count FROM clientes');
    console.log('Clientes count:', (results[0] as any).count);

    const [results2] = await sequelize.query('SELECT count(*) as count FROM users');
    console.log('Users count:', (results2[0] as any).count);

    const [results3] = await sequelize.query('SELECT count(*) as count FROM produtos');
    console.log('Produtos count:', (results3[0] as any).count);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

test();
