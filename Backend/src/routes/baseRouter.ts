import AuthRouter from "./authRouter.js";
import router from "express";

const baseRouter = router.Router();

baseRouter.use("/auth", AuthRouter);

export default baseRouter;