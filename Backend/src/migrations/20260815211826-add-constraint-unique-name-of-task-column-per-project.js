'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('task_statuses', {
      fields: ['projectId', 'status'],
      type: 'unique',
      name: 'unique_status_per_project',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      'task_statuses',
      'unique_status_per_project'
    );
  },
};