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
import { MainTaskStatus } from "../enums/mainTaskStatus";
import Task from "./task";
import Project from "./project";
export default class TaskStatus extends Model<
    InferAttributes<TaskStatus, {
        omit: "createdAt" | "updatedAt";
    }>,
    InferCreationAttributes<TaskStatus, {
        omit: "createdAt" | "updatedAt";
    }>
> {
    declare status: CreationOptional<string>;
    declare projectId: ForeignKey<Project["id"]>;
    declare order: number;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare project?: NonAttribute<Project>;
    declare tasks?: NonAttribute<Task[]>;

    static associate(models: Models) {
        TaskStatus.belongsTo(models.Project, {
            foreignKey: "projectId",
            as: "project",
            onDelete: "CASCADE",
        });
    }
}

TaskStatus.init(
    {
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },

        projectId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },

        order: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "TaskStatus",
        tableName: "task_statuses",
        timestamps: true,
    }
);