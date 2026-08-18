"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tasks", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("todo", "in_progress", "done"),
        allowNull: true,
        defaultValue: "todo",
      },
      priority: {
        type: Sequelize.ENUM("low", "medium", "high"),
        allowNull: true,
        defaultValue: "medium",
      },
      estimatedTime: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      projectId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "projects",
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
    await queryInterface.dropTable("tasks");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_tasks_status";'
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_tasks_priority";'
    );
  },
};