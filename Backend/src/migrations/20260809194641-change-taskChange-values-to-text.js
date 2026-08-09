'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('task_changes', 'oldValue', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.changeColumn('task_changes', 'newValue', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('task_changes', 'oldValue', {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    await queryInterface.changeColumn('task_changes', 'newValue', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  }
};