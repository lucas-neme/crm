'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn('clientes', 'chat_id', {
                type: Sequelize.STRING,
                allowNull: true,
            });
        } catch (e) {
            if (e.message?.includes('already exists') || e.original?.code === '42701') {
                console.warn('Migration 20260208000000 skipped: chat_id already exists');
                return;
            }
            throw e;
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('clientes', 'chat_id');
    },
};
