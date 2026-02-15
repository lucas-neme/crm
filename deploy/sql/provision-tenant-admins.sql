-- Provisiona usuarios admin por tenant no banco shared.
-- Email padrao: admin@<tenant>.com
-- Senha padrao: admin123*
--
-- Execute no Postgres do CRM.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tenant: crm
INSERT INTO users (
  id,
  email,
  tenant_id,
  "passwordHash",
  name,
  "isActive",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'admin@crm.com',
  'crm',
  crypt('admin123*', gen_salt('bf', 10)),
  'Admin CRM',
  true,
  now(),
  now()
)
ON CONFLICT (tenant_id, email)
DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  name = EXCLUDED.name,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = now();

-- Tenant: crm2
INSERT INTO users (
  id,
  email,
  tenant_id,
  "passwordHash",
  name,
  "isActive",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'admin@crm2.com',
  'crm2',
  crypt('admin123*', gen_salt('bf', 10)),
  'Admin CRM2',
  true,
  now(),
  now()
)
ON CONFLICT (tenant_id, email)
DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  name = EXCLUDED.name,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = now();

-- Modelo para novos tenants:
-- Troque <tenant> nos 3 pontos.
-- INSERT INTO users (... )
-- VALUES (... 'admin@<tenant>.com', '<tenant>', crypt('admin123*', gen_salt('bf', 10)), ... )
-- ON CONFLICT (tenant_id, email) DO UPDATE ...
