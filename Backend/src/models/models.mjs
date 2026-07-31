import User from "./user.mjs";
import Project from "./project.mjs";
import Task from "./task.mjs";
import TimeEntry from "./timeEntry.mjs";
import TaskHistory from "./taskHistory.mjs";
import TaskChange from "./taskChange.mjs";

const models = {
    User,
    Project,
    Task,
    TimeEntry,
    TaskHistory,
    TaskChange,
};

Object.keys(models).forEach((modelName) => {
    if (models[modelName].associate) {
    models[modelName].associate(models);
    }
});

export default models;