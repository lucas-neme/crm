'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const tables = [
            'users',
            'clientes',
            'produtos',
            'negocios',
            'negocio_produtos',
            'enderecos',
            'contas_pagar',
            'contas_receber',
            'imoveis',
            'empreendimentos',
            'unidades',
            'reservas',
            'propostas',
        ];

        for (const table of tables) {
            await queryInterface.sequelize.query(`
                ALTER TABLE ${table}
                ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(100);
            `);
            await queryInterface.sequelize.query(`
                UPDATE ${table}
                SET tenant_id = 'default'
                WHERE tenant_id IS NULL;
            `);
            await queryInterface.sequelize.query(`
                ALTER TABLE ${table}
                ALTER COLUMN tenant_id SET DEFAULT 'default';
            `);
            await queryInterface.sequelize.query(`
                ALTER TABLE ${table}
                ALTER COLUMN tenant_id SET NOT NULL;
            `);
            await queryInterface.sequelize.query(`
                CREATE INDEX IF NOT EXISTS idx_${table}_tenant_id ON ${table}(tenant_id);
            `);
        }

        // Users: unique email per tenant
        await queryInterface.sequelize.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;`);
        await queryInterface.sequelize.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS users_tenant_id_email_key
            ON users (tenant_id, email);
        `);

        // Clientes: unique codigo/email/telefone per tenant
        await queryInterface.sequelize.query(`ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_codigo_key;`);
        await queryInterface.sequelize.query(`ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_email_key;`);
        await queryInterface.sequelize.query(`ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_telefone_key;`);
        await queryInterface.sequelize.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS clientes_tenant_id_codigo_key
            ON clientes (tenant_id, codigo);
        `);
        await queryInterface.sequelize.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS clientes_tenant_id_email_key
            ON clientes (tenant_id, email);
        `);
        await queryInterface.sequelize.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS clientes_tenant_id_telefone_key
            ON clientes (tenant_id, telefone);
        `);

        // Produtos and negocios codigo uniqueness per tenant
        await queryInterface.sequelize.query(`ALTER TABLE produtos DROP CONSTRAINT IF EXISTS produtos_codigo_key;`);
        await queryInterface.sequelize.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS produtos_tenant_id_codigo_key
            ON produtos (tenant_id, codigo);
        `);

        await queryInterface.sequelize.query(`ALTER TABLE negocios DROP CONSTRAINT IF EXISTS negocios_codigo_key;`);
        await queryInterface.sequelize.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS negocios_tenant_id_codigo_key
            ON negocios (tenant_id, codigo);
        `);

        // Imobiliario natural unique fields per tenant
        await queryInterface.sequelize.query(`ALTER TABLE unidades DROP CONSTRAINT IF EXISTS unidades_codigo_interno_key;`);
        await queryInterface.sequelize.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS unidades_tenant_id_codigo_interno_key
            ON unidades (tenant_id, codigo_interno);
        `);
    },

    down: async (queryInterface, Sequelize) => {
        const tables = [
            'users',
            'clientes',
            'produtos',
            'negocios',
            'negocio_produtos',
            'enderecos',
            'contas_pagar',
            'contas_receber',
            'imoveis',
            'empreendimentos',
            'unidades',
            'reservas',
            'propostas',
        ];

        for (const table of tables) {
            await queryInterface.removeColumn(table, 'tenant_id');
        }
    },
};
