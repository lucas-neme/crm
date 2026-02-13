const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

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

        console.log('--- Verificando Clientes ---');
        const res = await client.query('SELECT id, nome, telefone, email FROM clientes ORDER BY "createdAt" DESC LIMIT 5');
        console.table(res.rows);

        console.log('\n--- Verificando Duplicidade de Telefone (apenas números) ---');
        const resDup = await client.query(`
      SELECT regexp_replace(telefone, '\\D', '', 'g') as tel_limpo, count(*) 
      FROM clientes 
      GROUP BY regexp_replace(telefone, '\\D', '', 'g') 
      HAVING count(*) > 1
    `);
        if (resDup.rows.length > 0) {
            console.log('Encontrados telefones duplicados (considerando apenas números):');
            console.table(resDup.rows);
        } else {
            console.log('Nenhum telefone duplicado encontrado.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
