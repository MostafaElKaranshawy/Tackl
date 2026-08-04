import router from "express";

import AuthRouter from "./authRouter.js";
import projectRouter from "./projectRouter.js";
import checkUser from "../middlewares/checkUser.js";
import TaskRouter from "./taskRouter.js";
import TimeEntryRouter from "./timeEntryRouter.js";

const baseRouter = router.Router();

baseRouter.use("/auth", AuthRouter);

baseRouter.use(checkUser); // Apply the checkUser middleware to all routes to allow authorization.

baseRouter.use("/projects", projectRouter);

baseRouter.use("/projects/:projectId/tasks", TaskRouter);

baseRouter.use("/tasks/:taskId/time-entries", TimeEntryRouter);

export default baseRouter;