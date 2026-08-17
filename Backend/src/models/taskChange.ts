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

export default class TaskChange extends Model<
    InferAttributes<TaskChange, {
        omit: "createdAt" | "updatedAt";
    }>,
    InferCreationAttributes<TaskChange, {
        omit: "createdAt" | "updatedAt";
    }>
> {
    declare id: CreationOptional<string>;
    declare fieldName: string;
    declare oldValue: CreationOptional<string | null>;
    declare newValue: CreationOptional<string | null>;
    declare actionType: CreationOptional<ActionType>;
    declare taskHistoryId: ForeignKey<string>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare taskHistory?: NonAttribute<Model>;
    static associate(models: Models) {
        TaskChange.belongsTo(models.TaskHistory, {
            foreignKey: "taskHistoryId",
            as: "taskHistory",
            onDelete: "CASCADE",
        });
    }
}

TaskChange.init(
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
        actionType: {
            type: DataTypes.ENUM(...Object.values(ActionType)),
            allowNull: false,
        },
        taskHistoryId: {
            type: DataTypes.UUID,
            allowNull: false,
        }
    },
    {
        sequelize,
        modelName: "TaskChange",
        tableName: "task_changes",
        timestamps: true,
    }
);