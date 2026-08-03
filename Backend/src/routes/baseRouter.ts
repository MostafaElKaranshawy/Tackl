import router from "express";

import AuthRouter from "./authRouter.js";
import projectRouter from "./projectRouter.js";
import checkUser from "../middlewares/checkUser.js";

const baseRouter = router.Router();

baseRouter.use("/auth", AuthRouter);

baseRouter.use(checkUser); // Apply the checkUser middleware to all routes below this line

baseRouter.use("/projects", projectRouter);

export default baseRouter;