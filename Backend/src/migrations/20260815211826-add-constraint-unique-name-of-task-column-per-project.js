'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('board_columns', {
      fields: ['projectId', 'name'],
      type: 'unique',
      name: 'unique_column_name_per_project',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      'board_columns',
      'unique_column_name_per_project'
    );
  },
};