'use strict';

const TENANT_TABLES = [
  'users',
  'clientes',
  'enderecos',
  'produtos',
  'negocios',
  'negocio_produtos',
  'contas_pagar',
  'contas_receber',
  'empreendimentos',
  'imoveis',
  'unidades',
  'reservas',
  'propostas',
  'documentos',
  'configuracoes',
];

module.exports = {
  async up(queryInterface) {
    const tenantDefault = String(process.env.DEFAULT_TENANT_ID || 'crm').trim().toLowerCase();

    await queryInterface.sequelize.query(`
      ALTER TABLE documentos
      ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(100);
    `);
    await queryInterface.sequelize.query(`
      UPDATE documentos
      SET tenant_id = COALESCE(tenant_id, '${tenantDefault}')
      WHERE tenant_id IS NULL;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE documentos
      ALTER COLUMN tenant_id SET NOT NULL;
    `);
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS documentos_numero_key;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE documentos DROP CONSTRAINT IF EXISTS documentos_numero_key;
    `);
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS documentos_tenant_id_numero_key
      ON documentos (tenant_id, numero);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE configuracoes
      ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(100);
    `);
    await queryInterface.sequelize.query(`
      UPDATE configuracoes
      SET tenant_id = '${tenantDefault}'
      WHERE tenant_id IS NULL;
    `);
    await queryInterface.sequelize.query(`
      UPDATE configuracoes
      SET tenant_id = split_part(chave, ':', 1),
          chave = substring(chave FROM position(':' IN chave) + 1)
      WHERE chave LIKE '%:%';
    `);
    await queryInterface.sequelize.query(`
      DELETE FROM configuracoes a
      USING configuracoes b
      WHERE a.ctid < b.ctid
        AND a.tenant_id = b.tenant_id
        AND a.chave = b.chave;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE configuracoes
      ALTER COLUMN tenant_id SET NOT NULL;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE configuracoes DROP CONSTRAINT IF EXISTS configuracoes_pkey;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE configuracoes
      ADD CONSTRAINT configuracoes_pkey PRIMARY KEY (tenant_id, chave);
    `);

    for (const table of TENANT_TABLES) {
      await queryInterface.sequelize.query(`
        ALTER TABLE ${table}
        ALTER COLUMN tenant_id SET NOT NULL;
      `);
    }

    await queryInterface.sequelize.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
    `);
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_tenant_id_email_key
      ON users (tenant_id, email);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE imoveis DROP CONSTRAINT IF EXISTS imoveis_codigo_key;
    `);
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS imoveis_tenant_id_codigo_key
      ON imoveis (tenant_id, codigo);
    `);

    const enableRls = String(process.env.ENABLE_RLS || 'true').toLowerCase() !== 'false';
    if (!enableRls) return;

    for (const table of TENANT_TABLES) {
      const policyName = `${table}_tenant_isolation`;
      await queryInterface.sequelize.query(`
        ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE ${table} FORCE ROW LEVEL SECURITY;
      `);
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public'
              AND tablename = '${table}'
              AND policyname = '${policyName}'
          ) THEN
            CREATE POLICY ${policyName}
            ON ${table}
            USING (tenant_id = current_setting('app.tenant_id', true)::text)
            WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::text);
          END IF;
        END $$;
      `);
    }
  },

  async down(queryInterface) {
    for (const table of TENANT_TABLES) {
      const policyName = `${table}_tenant_isolation`;
      await queryInterface.sequelize.query(`
        DROP POLICY IF EXISTS ${policyName} ON ${table};
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE ${table} NO FORCE ROW LEVEL SECURITY;
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;
      `);
    }

    await queryInterface.sequelize.query(`
      ALTER TABLE configuracoes DROP CONSTRAINT IF EXISTS configuracoes_pkey;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE configuracoes
      ADD CONSTRAINT configuracoes_pkey PRIMARY KEY (chave);
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE configuracoes DROP COLUMN IF EXISTS tenant_id;
    `);

    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS documentos_tenant_id_numero_key;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE documentos DROP COLUMN IF EXISTS tenant_id;
    `);
  },
};
