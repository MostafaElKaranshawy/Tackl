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
import { TaskStatus } from "../enums/taskStatus";
import Task from "./task";

export default class BoardColumn extends Model<
    InferAttributes<BoardColumn, {
        omit: "createdAt" | "updatedAt";
    }>,
    InferCreationAttributes<BoardColumn, {
        omit: "createdAt" | "updatedAt";
    }>
> {
    declare id: CreationOptional<string>;
    declare projectId: ForeignKey<string>;
    declare name: CreationOptional<string>;
    declare status: CreationOptional<TaskStatus>;
    declare order: CreationOptional<number>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare tasks?: NonAttribute<Task[]>;

    static associate(models: Models) {
        BoardColumn.belongsTo(models.Project, {
            foreignKey: "projectId",
            as: "project",
            onDelete: "CASCADE",
        });
    }
}

BoardColumn.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        projectId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(TaskStatus)),
            allowNull: false,
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "BoardColumn",
        tableName: "board_columns",
        timestamps: true,
        indexes: [
            {
                fields: ["projectId"],
            },
            {
                fields: ["createdAt"],
            },
            {
                fields: ["name"],
            },
            {
                unique: true,
                name: "unique_column_name_per_project",
                fields: ["projectId", "name"],
            },
        ],
    }
);