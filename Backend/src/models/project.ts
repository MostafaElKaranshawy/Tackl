import { sequelize, DataTypes } from "../config/database";
import {Models} from "./models";

const Project = sequelize.define(
  "Project",
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
  },
  {
    tableName: "projects",
    timestamps: true,
  }
);


(Project as typeof Project & {
  associate?: (models: Models) => void;
}).associate = (models: Models) => {
  
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
};

export default Project;