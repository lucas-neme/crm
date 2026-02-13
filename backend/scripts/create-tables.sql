-- Script para criar todas as tabelas do CRM
-- Execute no pgAdmin ou outro cliente PostgreSQL

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Dropar tabelas existentes (na ordem correta por causa das FKs)
DROP TABLE IF EXISTS negocio_produtos CASCADE;
DROP TABLE IF EXISTS contas_receber CASCADE;
DROP TABLE IF EXISTS contas_pagar CASCADE;
DROP TABLE IF EXISTS negocios CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS documentos CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
DROP TABLE IF EXISTS enderecos CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Tabela: enderecos
CREATE TABLE enderecos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(50) NOT NULL,
    complemento VARCHAR(255),
    bairro VARCHAR(255) NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    estado VARCHAR(255) NOT NULL,
    pais VARCHAR(255) NOT NULL,
    cep VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: documentos
CREATE TABLE documentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('CPF', 'CNPJ', 'PASSAPORTE')),
    numero VARCHAR(50) NOT NULL UNIQUE,
    "isValido" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: clientes
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo INTEGER NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    tipo_pessoa VARCHAR(20) NOT NULL CHECK (tipo_pessoa IN ('FISICA', 'JURIDICA')),
    "enderecoId" UUID REFERENCES enderecos(id),
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: produtos
CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo INTEGER NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 0,
    "valorUnitario" DECIMAL(10, 2) NOT NULL,
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: negocios
CREATE TABLE negocios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo INTEGER NOT NULL UNIQUE,
    "dataEntrega" TIMESTAMP WITH TIME ZONE,
    "clienteId" UUID NOT NULL REFERENCES clientes(id),
    entrega BOOLEAN DEFAULT FALSE,
    "enderecoEntregaId" UUID REFERENCES enderecos(id),
    "valorFinal" DECIMAL(10, 2) NOT NULL,
    data_venda DATE NOT NULL DEFAULT CURRENT_DATE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: negocio_produtos (tabela de junção)
CREATE TABLE negocio_produtos (
    "negocioId" UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    "produtoId" UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL,
    "valorUnitario" DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY ("negocioId", "produtoId")
);

-- Tabela: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    "passwordHash" VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: contas_pagar
CREATE TABLE contas_pagar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status VARCHAR(20) DEFAULT 'PENDENTE' NOT NULL CHECK (status IN ('PENDENTE', 'PAGO', 'CANCELADO', 'ATRASADO')),
    observacoes VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: contas_receber
CREATE TABLE contas_receber (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_recebimento DATE,
    status VARCHAR(20) DEFAULT 'PENDENTE' NOT NULL CHECK (status IN ('PENDENTE', 'PAGO', 'CANCELADO', 'ATRASADO')),
    observacoes VARCHAR(255),
    cliente_id UUID REFERENCES clientes(id),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_clientes_codigo ON clientes(codigo);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_produtos_codigo ON produtos(codigo);
CREATE INDEX idx_negocios_codigo ON negocios(codigo);
CREATE INDEX idx_negocios_cliente ON negocios("clienteId");
CREATE INDEX idx_negocios_data_venda ON negocios(data_venda);
CREATE INDEX idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX idx_contas_receber_vencimento ON contas_receber(data_vencimento);

-- Mensagem de conclusão
DO $$
BEGIN
    RAISE NOTICE 'Todas as tabelas foram criadas com sucesso!';
END $$;
