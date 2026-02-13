'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Adiciona a coluna data_venda com a data de hoje para registros existentes
      await queryInterface.addColumn('negocios', 'data_venda', {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_DATE'),
      });
    } catch (e) {
      if (e.message?.includes('already exists') || e.original?.code === '42701') {
        console.warn('Migration 20260203000002 skipped: data_venda already exists');
        return;
      }
      throw e;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('negocios', 'data_venda');
  },
};
