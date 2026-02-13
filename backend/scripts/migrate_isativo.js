const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
};

async function run() {
    const client = new Client(config);

    try {
        await client.connect();
        console.log('Conectado ao banco de dados.');

        // Verificar se a coluna isActive existe
        const checkRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='clientes' AND column_name='isActive';
    `);

        if (checkRes.rows.length > 0) {
            console.log('Coluna "isActive" encontrada. Renomeando para "isAtivo"...');
            await client.query('ALTER TABLE clientes RENAME COLUMN "isActive" TO "isAtivo";');
            console.log('Coluna renomeada com sucesso.');
        } else {
            console.log('Coluna "isActive" não encontrada. Verificando "isAtivo"...');
            const checkAtivo = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='clientes' AND column_name='isAtivo';
      `);

            if (checkAtivo.rows.length > 0) {
                console.log('Coluna "isAtivo" já existe.');
            } else {
                console.log('Criando coluna "isAtivo"...');
                await client.query('ALTER TABLE clientes ADD COLUMN "isAtivo" BOOLEAN DEFAULT true;');
                await client.query('UPDATE clientes SET "isAtivo" = true WHERE "isAtivo" IS NULL;');
                console.log('Coluna criada.');
            }
        }

        // Garantir default
        await client.query('ALTER TABLE clientes ALTER COLUMN "isAtivo" SET DEFAULT true;');

    } catch (err) {
        console.error('Erro ao executar migração:', err);
    } finally {
        await client.end();
    }
}

run();
