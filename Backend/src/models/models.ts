import User from "./user";
import Project from "./project";
import Task from "./task";
import TimeEntry from "./timeEntry";
import TaskHistory from "./taskHistory";
import TaskChange from "./taskChange";

export interface Models {
    User: typeof import("./user").default;
    Project: typeof import("./project").default;
    Task: typeof import("./task").default;
    TimeEntry: typeof import("./timeEntry").default;
    TaskHistory: typeof import("./taskHistory").default;
    TaskChange: typeof import("./taskChange").default;
}

const models = {
    User,
    Project,
    Task,
    TimeEntry,
    TaskHistory,
    TaskChange,
};

(Object.keys(models) as Array<keyof typeof models>).forEach((modelName) => {
    const model = models[modelName];

    if ("associate" in model && typeof model.associate === "function") {
        model.associate(models);
    }
});

export default models;