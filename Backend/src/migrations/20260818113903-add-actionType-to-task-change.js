"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("task_changes", "actionType", {
      type: Sequelize.ENUM(
        "created",
        "updated",
        "deleted"
      ),
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("task_changes", "actionType");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_task_changes_actionType";'
    );
  },
};