"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("task_histories", "fieldName", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("task_histories", "fieldName");
  },
};