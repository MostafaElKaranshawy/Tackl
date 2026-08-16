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
import User from "./user";

export default class Project extends Model<
    InferAttributes<Project, {
        omit: "createdAt" | "updatedAt";
    }>,
    InferCreationAttributes<Project, {
        omit: "createdAt" | "updatedAt";
    }>
> {
    declare id: CreationOptional<string>;
    declare name: string;
    declare description: CreationOptional<string | null>;
    declare userId: ForeignKey<User["id"]>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare owner?: NonAttribute<User>;
    declare tasks?: NonAttribute<Model[]>;
    static associate(models: Models) {
        Project.belongsTo(models.User, {
            foreignKey: "userId",
            as: "owner",
            onDelete: "CASCADE",
        });

        Project.hasMany(models.Task, {
            foreignKey: "projectId",
            as: "tasks",
            onDelete: "CASCADE",
        });


        Project.hasMany(models.TaskStatus, {
            foreignKey: "projectId",
            as: "taskStatuses",
            onDelete: "CASCADE",
        });
    }
}

Project.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "Project",
        tableName: "projects",
        timestamps: true,
    }
);