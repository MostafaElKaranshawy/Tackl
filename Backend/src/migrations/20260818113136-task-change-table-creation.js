"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("task_changes", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      fieldName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      oldValue: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      newValue: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      taskHistoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "task_histories",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("task_changes");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_task_changes_actionType";'
    );
  },
};