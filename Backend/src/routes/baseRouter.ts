import router from "express";

import AuthRouter from "./authRouter.js";
import projectRouter from "./projectRouter.js";
import checkUser from "../middlewares/checkUser.js";
import TaskRouter from "./taskRouter.js";
import TimeEntryRouter from "./timeEntryRouter.js";
import TaskHistoryRouter from "./taskHistoryRouter.js";
import BoardColumnRouter from "./boardColumnRouter.js";

const baseRouter = router.Router();

baseRouter.use("/auth", AuthRouter);

baseRouter.use(checkUser); // Apply the checkUser middleware to all routes to allow authorization.

baseRouter.use("/projects", projectRouter);

baseRouter.use("/projects/:projectId/tasks", TaskRouter);

baseRouter.use("/projects/:projectId/tasks/:taskId/time-entries", TimeEntryRouter);

baseRouter.use("/projects/:projectId/tasks/:taskId/history", TaskHistoryRouter);

baseRouter.use("/projects/:projectId/board-columns", BoardColumnRouter);
export default baseRouter;