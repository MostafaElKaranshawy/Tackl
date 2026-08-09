import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
    NonAttribute,
} from "sequelize";
import { sequelize } from "../config/database";
import { Models } from "./models";

export default class TimeEntry extends Model<
    InferAttributes<TimeEntry, {
        omit: "createdAt" | "updatedAt";
    }>,
    InferCreationAttributes<TimeEntry, {
        omit: "createdAt" | "updatedAt";
    }>
> {
    declare id: CreationOptional<string>;
    declare duration: number;
    declare date: Date;
    declare note: CreationOptional<string | null>;
    declare taskId: ForeignKey<string>;
    declare task?: NonAttribute<Model>;
    declare readonly createdAt: CreationOptional<Date>;
    declare readonly updatedAt: CreationOptional<Date>;

    static associate(models: Models) {
        TimeEntry.belongsTo(models.Task, {
            foreignKey: "taskId",
            as: "task",
            onDelete: "CASCADE",
        });
    }
}

TimeEntry.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        taskId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "TimeEntry",
        tableName: "time_entries",
        timestamps: true,
    }
);