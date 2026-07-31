import { sequelize, DataTypes } from "../config/database.mjs";

const Task = sequelize.define(
    "Task",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("todo", "in_progress", "done"),
            defaultValue: "todo",
        },
        priority: {
            type: DataTypes.ENUM("low", "medium", "high"),
            defaultValue: "medium",
        },
        estimatedTime: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "tasks",
        timestamps: true,
    },
);

Task.associate = (models) => {
    Task.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project",
        onDelete: "CASCADE",
    });

    Task.hasMany(models.TimeEntry, {
        foreignKey: "taskId",
        as: "timeEntries",
        onDelete: "CASCADE",
    });

    Task.hasMany(models.TaskHistory, {
        foreignKey: "taskId",
        as: "taskHistories",
        onDelete: "CASCADE",
    });
}

export default Task;