'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('task_histories', 'fieldName', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Task',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('task_histories', 'fieldName');
  }
};
