'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addColumn('tasks', 'columnId', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    queryInterface.addConstraint('tasks', {
      fields: ['columnId'],
      type: 'foreign key',
      name: 'fk_tasks_columnId',
      references: {
        table: 'boards_columns',
        field: 'id',
      },
      onDelete: 'SET NULL',
    });
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeConstraint('tasks', 'fk_tasks_columnId');
    queryInterface.removeColumn('tasks', 'columnId');
  }
};
