import { sequelize, DataTypes } from "../config/database.js";
import { Models } from "./models";

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
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
        tableName: "users",
        timestamps: true,
    }
);

(User as typeof User & {
    associate?: (models: Models) => void;
}).associate = (models: Models) => {
    User.hasMany(models.Project, {
        foreignKey: "userId",
        as: "projects",
        onDelete: "CASCADE",
    });
};

export default User;