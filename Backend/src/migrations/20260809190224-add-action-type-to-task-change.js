'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn('task_changes', 'actionType', {
      type: Sequelize.ENUM('created', 'updated', 'deleted'),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('task_changes', 'actionType');
  }
};