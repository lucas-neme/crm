'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn('contas_receber', 'cliente_id', {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'clientes',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            });
        } catch (e) {
            if (e.message?.includes('already exists') || e.original?.code === '42701') {
                console.warn('Migration 20260207000002 skipped: cliente_id already exists');
                return;
            }
            throw e;
        }
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('contas_receber', 'cliente_id');
    },
};
