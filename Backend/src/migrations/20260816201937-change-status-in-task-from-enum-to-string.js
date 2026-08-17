'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'tasks',
      'status',
      {
        type: Sequelize.STRING,
        allowNull: false,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'tasks',
      'status',
      {
        type: Sequelize.ENUM('todo', 'in_progress', 'done'),
        allowNull: false,
      }
    );
  },
};