import { sequelize, DataTypes } from "../config/database";
import { Models } from "./models";

const TaskHistory = sequelize.define(
  "TaskHistory",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    actionType: {
      type: DataTypes.ENUM("created", "updated", "deleted"),
    },
  },
  {
    tableName: "task_histories",
    timestamps: true,
    indexes: [
      {
        fields: ["taskId"],
      },
      {
        fields: ["createdAt"],
      },
    ],
  }
);

(TaskHistory as typeof TaskHistory & {
  associate?: (models: Models) => void;
}).associate = (models) => {
  TaskHistory.belongsTo(models.Task, {
    foreignKey: "taskId",
    as: "task",
    onDelete: "CASCADE",
  });

  TaskHistory.belongsTo(models.User, {
    foreignKey: "userId",
    as: "actionBy",
    onDelete: "CASCADE",
  });

  TaskHistory.hasMany(models.TaskChange, {
    foreignKey: "taskHistoryId",
    as: "taskChanges",
    onDelete: "CASCADE",
  });
};

export default TaskHistory;