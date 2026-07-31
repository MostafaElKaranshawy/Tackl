import AuthController from "../controllers/authController.js";
import passwordValidator from "../middlewares/passwordValidator.js";
import emailValidator from "../middlewares/emailValidator.js";
import nameValidator from "../middlewares/nameValidator.js";

import router from "express";


const authRouter = router.Router();

authRouter.post("/signUp", 
    nameValidator,
    emailValidator,
    passwordValidator,
    AuthController.signUp);

export default authRouter;