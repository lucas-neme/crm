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
        console.log('Connected to database...');

        await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

        // 1. Create configuracoes table
        const createConfigTable = `
      CREATE TABLE IF NOT EXISTS configuracoes (
        chave VARCHAR(255) PRIMARY KEY,
        valor VARCHAR(255) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
        await client.query(createConfigTable);
        console.log('Table configuracoes checked/created.');

        // Seed default config
        const seedConfig = `
      INSERT INTO configuracoes (chave, valor, "createdAt", "updatedAt")
      VALUES ('produto_modulo', 'STANDARD', NOW(), NOW())
      ON CONFLICT (chave) DO NOTHING;
    `;
        await client.query(seedConfig);
        console.log('Default configuration seeded.');

        // 2. Create imoveis table
        const createImoveisTable = `
      CREATE TABLE IF NOT EXISTS imoveis (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        codigo SERIAL,
        titulo VARCHAR(255) NOT NULL,
        valor DECIMAL(10, 2) NOT NULL,
        apresentacao TEXT,
        tipo VARCHAR(50) NOT NULL DEFAULT 'CASA',
        localizacao VARCHAR(255),
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
        // Note: Model used isAtivo, existing produto used isActive. I used isAtivo in my model definition (step 840).
        // Let's stick to isAtivo in model, but I should verify my model definition. Step 840 used isAtivo.
        // The previous existing produto model used isActive (Step 812).
        // I should probably be consistent. I will use isAtivo in table definition too if I used it in model.
        // Checking Step 840: yes, `isAtivo: boolean;`.
        // Wait, Step 812 (Standard Produto) uses `isActive`.
        // Mixing naming conventions (English/Portuguese) is confusing. Standard seems to use `isActive`.
        // But my new `imovel.model.ts` used `isAtivo`.
        // I will stick to `isAtivo` for Imovel as it is a PT-BR heavy domain (Imobiliaria).

        // Correcting SQL to use isAtivo
        const createImoveisTableCorrected = `
      CREATE TABLE IF NOT EXISTS imoveis (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        codigo SERIAL,
        titulo VARCHAR(255) NOT NULL,
        valor DECIMAL(10, 2) NOT NULL,
        apresentacao TEXT,
        tipo VARCHAR(50) NOT NULL DEFAULT 'CASA',
        localizacao VARCHAR(255),
        "isAtivo" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

        await client.query(createImoveisTableCorrected);
        console.log('Table imoveis checked/created.');


    } catch (err) {
        console.error('Error during setup:', err);
    } finally {
        await client.end();
    }
}

run();
