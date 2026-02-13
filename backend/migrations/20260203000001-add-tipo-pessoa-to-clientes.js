'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Adiciona a coluna tipo_pessoa como nullable temporariamente
      await queryInterface.addColumn('clientes', 'tipo_pessoa', {
        type: Sequelize.ENUM('FISICA', 'JURIDICA', 'ESTRANGEIRA'),
        allowNull: true,
      });

      // Atualiza todos os registros existentes para FISICA
      await queryInterface.sequelize.query(
        `UPDATE clientes SET tipo_pessoa = 'FISICA' WHERE tipo_pessoa IS NULL`
      );

      // Torna a coluna NOT NULL após o update
      await queryInterface.changeColumn('clientes', 'tipo_pessoa', {
        type: Sequelize.ENUM('FISICA', 'JURIDICA', 'ESTRANGEIRA'),
        allowNull: false,
      });
    } catch (e) {
      // Check for "already exists" error (Postgres code 42701 for duplicate column)
      if (e.message?.includes('already exists') || e.original?.code === '42701') {
        console.warn('Migration 20260203000001 skipped: tipo_pessoa already exists');
        return;
      }
      throw e;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('clientes', 'tipo_pessoa');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_clientes_tipo_pessoa";');
  },
};
