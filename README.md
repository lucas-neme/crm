# CRM SaaS (Shared Multi-Tenant)

Projeto full-stack com backend NestJS + frontend Vue, rodando em uma unica stack Docker e multi-tenant logico.

## Estrutura
```text
backend/   API NestJS
frontend/  App Vue + Nginx
```

## Modelo de tenancy (modo atual)
- Uma stack (`docker-compose.yml`)
- Um banco PostgreSQL (padrao: `crm`)
- Multiplos tenants separados por `tenant_id` nas tabelas
- Tenant resolvido pelo dominio/header (`x-tenant-id`)
- Middleware global no backend injeta tenant no request context
- Backend nunca confia em `tenant_id` enviado no payload

## Hardening de isolamento
- Migration: `backend/migrations/20260215000000-hardening-tenant-and-rls.js`
- Essa migration:
  - torna `tenant_id` obrigatorio em todas as tabelas de dominio
  - adiciona `tenant_id` em `configuracoes` e `documentos`
  - aplica isolamento por policy RLS no PostgreSQL
- Controle via env:
  - `ENABLE_RLS=true` (opcional; padrao da migration e `false`)
  - `DEFAULT_TENANT_ID=crm` (fallback para dados legados)

## Deploy (shared only)
1. Crie o arquivo de ambiente:
```bash
cp .env.shared.example .env.shared
```
2. Ajuste secrets e conexao do Postgres em `.env.shared`.
3. Suba a stack:
```bash
docker compose --env-file .env.shared -p crm-shared up -d --build
```

## Nginx Proxy Manager
Todos os dominios de tenants apontam para o mesmo frontend:
- `crm.wampa.com.br` -> `frontend:80`
- `crm2.wampa.com.br` -> `frontend:80`
- `crm3.wampa.com.br` -> `frontend:80`

## Swagger
- URL: `https://SEU_DOMINIO/api/docs`
- Rotas protegidas exigem Bearer token.

## Termos para pesquisar (sua arquitetura)
- `Shared-database multi-tenancy`
- `Tenant discriminator column`
- `Tenant isolation in application layer`
- `Single-stack multi-tenant SaaS`
- `PostgreSQL Row Level Security (RLS)` (opcional para endurecer isolamento)

## Documentacao adicional
- `backend/README.md`
- `backend/GETTING_STARTED.md`
