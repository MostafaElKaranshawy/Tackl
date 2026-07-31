import AuthController from "../controllers/authController.js";
import passwordValidator from "../middlewares/passwordValidator.js";
import emailValidator from "../middlewares/emailValidator.js";
import nameValidator from "../middlewares/nameValidator.js";

import router from "express";


const authRouter = router.Router();

/**
 * @openapi
 * /api/auth/signUp:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mostafa Elkaranshawy
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mostafa@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPassword123!
 *     responses:
 *       "201":
 *         description: User created successfully.
 *       "400":
 *         description: Missing or invalid request data.
 *       "409":
 *         description: An account with this email already exists.
 *       "500":
 *         description: Internal server error.
 */
authRouter.post(
    "/signUp",
    nameValidator,
    emailValidator,
    passwordValidator,
    AuthController.signUp
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user and return a JWT token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mostafa@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPassword123!
 *     responses:
 *       "200":
 *         description: User logged in successfully.
 *       "401":
 *         description: Invalid email or password.
 *       "500":
 *         description: Internal server error.
 */
authRouter.post("/login",
    emailValidator,
    AuthController.login);

export default authRouter;