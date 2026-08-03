import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
} from "sequelize";
import { sequelize } from "../config/database";
import { Models } from "./models";

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
    declare taskHistoryId: ForeignKey<string>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

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