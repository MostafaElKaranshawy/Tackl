import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
    NonAttribute,
} from "sequelize";
import { sequelize } from "../config/database";
import { Models } from "./models";

export default class TaskHistory extends Model<
    InferAttributes<TaskHistory, {
        omit: "createdAt" | "updatedAt";
    }>,
    InferCreationAttributes<TaskHistory, {
        omit: "createdAt" | "updatedAt";
    }>
> {
    declare id: CreationOptional<string>;
    declare actionType: "created" | "updated" | "deleted";
    declare taskId: ForeignKey<string>;
    declare userId: ForeignKey<string>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare task?: NonAttribute<Model>;
    declare actionBy?: NonAttribute<Model>;
    declare taskChanges?: NonAttribute<Model[]>;
    
    static associate(models: Models) {
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
    }
}

TaskHistory.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        actionType: {
            type: DataTypes.ENUM("created", "updated", "deleted"),
            allowNull: false,
        },
        taskId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "TaskHistory",
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