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
import { ActionType } from "../enums/actionType";

export default class TaskHistory extends Model<
    InferAttributes<TaskHistory, {
        omit: "createdAt" | "updatedAt";
    }>,
    InferCreationAttributes<TaskHistory, {
        omit: "createdAt" | "updatedAt";
    }>
> {
    declare id: CreationOptional<string>;
    declare taskId: ForeignKey<string>;
    declare userId: ForeignKey<string>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare actionType: CreationOptional<ActionType>;
    declare task?: NonAttribute<Model>;
    declare actionBy?: NonAttribute<Model>;
    declare fieldName: CreationOptional<string>;
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
        taskId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        fieldName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        actionType: {
            type: DataTypes.ENUM(...Object.values(ActionType)),
            allowNull: false,
            defaultValue: 'created',
        }
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