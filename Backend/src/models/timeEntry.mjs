import { sequelize, DataTypes } from '../config/database.mjs';

const TimeEntry = sequelize.define(
    "TimeEntry",
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
        }
    },
    {
        tableName: "time_entries",
        timestamps: true,
    }
);

TimeEntry.associate = (models) => {
    TimeEntry.belongsTo(models.Task, {
        foreignKey: "taskId",
        as: "task",
        onDelete: "CASCADE",
    });
}

export default TimeEntry;