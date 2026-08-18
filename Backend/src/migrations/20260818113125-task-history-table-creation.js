"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("task_histories", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      taskId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "tasks",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      actionType: {
        type: Sequelize.ENUM(
          "created",
          "updated",
          "deleted"
        ),
        allowNull: false,
        defaultValue: "created",
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

    await queryInterface.addIndex("task_histories", ["taskId"]);
    await queryInterface.addIndex("task_histories", ["createdAt"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("task_histories");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_task_histories_actionType";'
    );
  },
};