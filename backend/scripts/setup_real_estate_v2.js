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
        console.log('Connected to database (Real Estate V2)...');

        // 1. Create empreendimentos table
        const createEmpreendimentos = `
      CREATE TABLE IF NOT EXISTS empreendimentos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'LANCAMENTO', -- LANCAMENTO, EM_OBRAS, PRONTO, ESGOTADO
        previsao_entrega DATE,
        descricao_curta TEXT,
        descricao_longa TEXT,
        
        -- Endereco
        endereco_cep VARCHAR(20),
        endereco_logradouro VARCHAR(255),
        endereco_numero VARCHAR(50),
        endereco_complemento VARCHAR(255),
        endereco_bairro VARCHAR(255),
        endereco_cidade VARCHAR(255),
        endereco_uf VARCHAR(2),
        
        -- JSON fields
        midias JSONB DEFAULT '[]', -- [{tipo: 'imagem', url: '...', ordem: 1}]
        regras_comissao JSONB DEFAULT '{}', -- {padrao: 5.0}
        
        is_ativo BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
        await client.query(createEmpreendimentos);
        console.log('Table empreendimentos created/checked.');

        // 2. Create unidades table
        const createUnidades = `
      CREATE TABLE IF NOT EXISTS unidades (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        empreendimento_id UUID REFERENCES empreendimentos(id) ON DELETE CASCADE,
        codigo_interno VARCHAR(50) UNIQUE NOT NULL, -- EMP-001-A101
        
        -- Caracteristicas
        tipo VARCHAR(50) NOT NULL, -- CASA, APARTAMENTO, COMERCIAL, TERRENO
        tipologia VARCHAR(50), -- Studio, 2Q, 3Q
        torre VARCHAR(50),
        andar VARCHAR(50),
        numero_unidade VARCHAR(50),
        
        -- Metragens e Comodos
        area_total DECIMAL(10, 2),
        area_privativa DECIMAL(10, 2),
        quartos INTEGER,
        suites INTEGER,
        banheiros INTEGER,
        vagas INTEGER,
        
        -- Valores
        valor_tabela DECIMAL(15, 2),
        valor_oferta DECIMAL(15, 2),
        valor_min_negociavel DECIMAL(15, 2),
        
        -- Status
        status_unidade VARCHAR(50) DEFAULT 'DISPONIVEL', -- DISPONIVEL, RESERVADO, PROPOSTA, VENDIDO
        status_publicacao VARCHAR(50) DEFAULT 'RASCUNHO', -- RASCUNHO, PUBLICADO, PAUSADO
        
        -- Publicacao
        canais_publicacao JSONB DEFAULT '[]', -- ['SITE', 'ZAP']
        link_anuncio TEXT,
        headline VARCHAR(255),
        descricao TEXT,
        tags JSONB DEFAULT '[]',
        
        midias JSONB DEFAULT '[]',
        
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
        await client.query(createUnidades);
        console.log('Table unidades created/checked.');

        // 3. Update clientes/leads (Add new columns if not exist)
        const updateClientes = `
      ALTER TABLE clientes 
      ADD COLUMN IF NOT EXISTS origem VARCHAR(50),
      ADD COLUMN IF NOT EXISTS interesse VARCHAR(50), -- COMPRA, VENDA, ALUGUEL
      ADD COLUMN IF NOT EXISTS pipeline_stage VARCHAR(50) DEFAULT 'NOVO',
      ADD COLUMN IF NOT EXISTS temperatura VARCHAR(50) DEFAULT 'MORNA',
      ADD COLUMN IF NOT EXISTS data_ultima_interacao TIMESTAMP;
    `;
        await client.query(updateClientes);
        console.log('Table clientes updated (Leads fields).');

        // 4. Create reservas table
        const createReservas = `
      CREATE TABLE IF NOT EXISTS reservas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        unidade_id UUID REFERENCES unidades(id),
        cliente_id UUID REFERENCES clientes(id),
        usuario_id UUID, -- Corretor (optional FK if users table exists, likely auth_users or just ID)
        
        data_inicio TIMESTAMP NOT NULL DEFAULT NOW(),
        data_fim TIMESTAMP NOT NULL, -- Validade
        status VARCHAR(50) DEFAULT 'ATIVA', -- ATIVA, VENCIDA, CANCELADA, CONVERTIDA
        
        observacoes TEXT,
        
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
        await client.query(createReservas);
        console.log('Table reservas created/checked.');

        // 5. Create propostas table
        const createPropostas = `
      CREATE TABLE IF NOT EXISTS propostas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        unidade_id UUID REFERENCES unidades(id),
        cliente_id UUID REFERENCES clientes(id),
        usuario_id UUID, 
        
        valor_proposto DECIMAL(15, 2) NOT NULL,
        condicoes_pagamento JSONB DEFAULT '{}', -- {entrada: ..., parcelas: ...}
        status VARCHAR(50) DEFAULT 'ENVIADA', -- ENVIADA, ANALISE, ACEITA, RECUSADA
        data_proposta TIMESTAMP NOT NULL DEFAULT NOW(),
        
        observacoes TEXT,
        
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
        await client.query(createPropostas);
        console.log('Table propostas created/checked.');

    } catch (err) {
        console.error('Error during Real Estate V2 setup:', err);
    } finally {
        await client.end();
    }
}

run();
