'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.removeColumn('task_histories', 'actionType');
  },

  async down(queryInterface, Sequelize) {
    queryInterface.addColumn('task_histories', 'actionType', {
      type: Sequelize.ENUM('created', 'updated', 'deleted'),
      allowNull: false,
    });
  }
};
