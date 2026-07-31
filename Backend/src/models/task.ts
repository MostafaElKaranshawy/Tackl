import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database";
import { Models } from "./models";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export default class Task extends Model<
    InferAttributes<Task, {
        omit: "createdAt" | "updatedAt";
    }>,
    InferCreationAttributes<Task, {
        omit: "createdAt" | "updatedAt";
    }>
> {
    declare id: CreationOptional<string>;
    declare title: string;
    declare description: CreationOptional<string | null>;
    declare status: CreationOptional<TaskStatus>;
    declare priority: CreationOptional<TaskPriority>;
    declare estimatedTime: CreationOptional<number | null>;
    declare dueDate: CreationOptional<Date | null>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    static associate(models: Models) {
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
}

Task.init(
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
        sequelize,
        modelName: "Task",
        tableName: "tasks",
        timestamps: true,
    }
);