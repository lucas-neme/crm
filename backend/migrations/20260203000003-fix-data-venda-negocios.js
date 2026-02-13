'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Atualiza todos os registros que possam estar sem data_venda
      await queryInterface.sequelize.query(
        `UPDATE negocios SET data_venda = CURRENT_DATE WHERE data_venda IS NULL`
      );
    } catch (e) {
      console.warn('Migration 20260203000003 warning: ' + e.message);
      // Non-critical update, can proceed or ignore if fails (e.g. table missing)
    }
  },

  async down(queryInterface, Sequelize) {
    // Não há necessidade de reverter esta correção
  },
};
