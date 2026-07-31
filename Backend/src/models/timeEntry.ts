import { sequelize, DataTypes } from '../config/database';
import { Models } from './models';

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


(TimeEntry as typeof TimeEntry & {
    associate?: (models: Models) => void;
}).associate = (models: Models) => {
    TimeEntry.belongsTo(models.Task, {
        foreignKey: "taskId",
        as: "task",
        onDelete: "CASCADE",
    });
}

export default TimeEntry;