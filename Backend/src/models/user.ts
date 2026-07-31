import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/database.js";
import { Models } from "./models.js";

export default class User extends Model<
    InferAttributes<User, {
        omit: "createdAt" | "updatedAt";
    }>,
    InferCreationAttributes<User, {
        omit: "createdAt" | "updatedAt";
    }>
> {
    declare id: CreationOptional<string>;
    declare name: string;
    declare email: string;
    declare password: string;

    declare readonly createdAt: CreationOptional<Date>;
    declare readonly updatedAt: CreationOptional<Date>;

    static associate(models: Models) {
        User.hasMany(models.Project, {
            foreignKey: "userId",
            as: "projects",
            onDelete: "CASCADE",
        });
    }
}

User.init(
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
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "users",
        timestamps: true,
        modelName: "User",
    }
);