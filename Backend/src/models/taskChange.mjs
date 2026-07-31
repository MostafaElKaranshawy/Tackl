import { sequelize, DataTypes } from '../config/database.mjs';

const TaskChange = sequelize.define(
    "TaskChange",
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
    },
    {
        tableName: "task_changes",
        timestamps: true,
    }
)

TaskChange.associate = (models) => {
    TaskChange.belongsTo(models.TaskHistory, {
        foreignKey: "taskHistoryId",
        as: "taskHistory",
        onDelete: "CASCADE",
    });
}

export default TaskChange;