import AuthController from "../controllers/authController.js";
import passwordValidator from "../middlewares/passwordValidator.js";
import emailValidator from "../middlewares/emailValidator.js";
import nameValidator from "../middlewares/nameValidator.js";

import router from "express";
import checkUser from "../middlewares/checkUser.js";


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


/**
 * @openapi
 * /api/auth/confirmEmail:
 *   get:
 *     summary: Confirm a user's email address using a token
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The confirmation token sent to the user's email.
 *     responses:
 *       "200":
 *         description: Email confirmed successfully.
 *       "400":
 *         description: Invalid or expired token.
 *       "404":
 *         description: User not found.
 */
authRouter.get(
    "/confirmEmail",
    AuthController.confirmEmail
);

/**
 * @openapi
 * /api/auth/getConfirmationLink:
 *   get:
 *     summary: Request a new email confirmation link
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: The email address of the user requesting a confirmation link.
 *     responses:
 *       "200":
 *         description: Confirmation link sent successfully.
 *       "400":
 *         description: Missing or invalid request data.
 *       "404":
 *         description: User not found.
 *       "429":
 *         description: Confirmation link was sent recently. Please check your email.
 *       "500":
 *         description: Internal server error.
 */

authRouter.get(
    "/getConfirmationLink",
    AuthController.getConfirmationLink
);


/**
 * @openapi
 * /api/auth/resetPasswordFromLink:
 *   put:
 *     summary: Reset a user's password using a token
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The password reset token sent to the user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: SecurePassword123!
 *     responses:
 *       "200":
 *         description: Password reset successfully.
 *       "400":
 *         description: Missing or invalid request data.
 *       "404":
 *         description: User not found.
 *       "500":
 *         description: Internal server error.
 */
authRouter.put(
    "/resetPasswordFromLink",
    passwordValidator,
    AuthController.resetPassword
);

/**
 * @openapi
 * /api/auth/resetPassword:
 *   put:
 *     summary: Reset a user's password using a token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: SecurePassword123!
 *     responses:
 *       "200":
 *         description: Password reset successfully.
 *       "400":
 *         description: Missing or invalid request data.
 *       "404":
 *         description: User not found.
 *       "500":
 *         description: Internal server error.
 */
authRouter.put(
    "/resetPassword",
    checkUser,
    passwordValidator,
    AuthController.resetPassword
);

/**
 * @openapi
 * /api/auth/getResetPasswordLink:
 *   get:
 *     summary: Request a new password reset link
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: The email address of the user requesting a password reset.
 *     responses:
 *       "200":
 *         description: Reset password link sent successfully.
 *       "400":
 *         description: Missing or invalid request data.
 *       "404":
 *         description: User not found.
 *       "429":
 *         description: Confirmation link was sent recently. Please check your email.
 *       "500":
 *         description: Internal server error.
 */
authRouter.get(
    "/getResetPasswordLink",
    AuthController.getResetPasswordLink
)

export default authRouter;