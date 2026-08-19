import User from "./user";
import Project from "./project";
import Task from "./task";
import TimeEntry from "./timeEntry";
import TaskHistory from "./taskHistory";
import TaskChange from "./taskChange";
import TaskStatus from "./taskStatus";

export const models = {
    User,
    Project,
    Task,
    TimeEntry,
    TaskHistory,
    TaskChange,
    TaskStatus,
};

export type Models = typeof models;

Object.values(models).forEach((model) => {
    if ("associate" in model && typeof model.associate === "function") {
        model.associate(models);
    }
});

export default models;