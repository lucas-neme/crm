'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            // Contas a Pagar
            await queryInterface.createTable('contas_pagar', {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    allowNull: false,
                    primaryKey: true,
                },
                descricao: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                valor: {
                    type: Sequelize.DECIMAL(10, 2),
                    allowNull: false,
                },
                data_vencimento: {
                    type: Sequelize.DATEONLY,
                    allowNull: false,
                },
                data_pagamento: {
                    type: Sequelize.DATEONLY,
                    allowNull: true,
                },
                status: {
                    type: Sequelize.ENUM('PENDENTE', 'PAGO', 'CANCELADO', 'ATRASADO'),
                    allowNull: false,
                    defaultValue: 'PENDENTE',
                },
                observacoes: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
            });
        } catch (e) {
            if (e.message?.includes('already exists') || e.original?.code === '42P07') {
                console.warn('Migration 20260207000001 (pagar) skipped: contas_pagar already exists');
            } else {
                throw e;
            }
        }

        try {
            // Contas a Receber
            await queryInterface.createTable('contas_receber', {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    allowNull: false,
                    primaryKey: true,
                },
                descricao: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                valor: {
                    type: Sequelize.DECIMAL(10, 2),
                    allowNull: false,
                },
                data_vencimento: {
                    type: Sequelize.DATEONLY,
                    allowNull: false,
                },
                data_recebimento: {
                    type: Sequelize.DATEONLY,
                    allowNull: true,
                },
                status: {
                    type: Sequelize.ENUM('PENDENTE', 'PAGO', 'CANCELADO', 'ATRASADO'),
                    allowNull: false,
                    defaultValue: 'PENDENTE',
                },
                observacoes: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
            });
        } catch (e) {
            if (e.message?.includes('already exists') || e.original?.code === '42P07') {
                console.warn('Migration 20260207000001 (receber) skipped: contas_receber already exists');
            } else {
                throw e;
            }
        }
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('contas_receber');
        await queryInterface.dropTable('contas_pagar');
        // Note: ENUMs might persist in Postgres, but simple dropTable is usually enough for dev re-runs if using sync force
    },
};
