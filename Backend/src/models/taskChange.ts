import { sequelize, DataTypes } from "../config/database";
import { Models } from "./models";

const TaskChange = sequelize.define(
  "TaskChange",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fieldName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    oldValue: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    newValue: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "task_changes",
    timestamps: true,
  }
);

(TaskChange as typeof TaskChange & {
  associate?: (models: Models) => void;
}).associate = (models: Models) => {
  TaskChange.belongsTo(models.Task, {
    foreignKey: "taskId",
    as: "task",
    onDelete: "CASCADE",
  });
};

export default TaskChange;