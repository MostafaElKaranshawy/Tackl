import AuthService from "../services/authService";
import AlreadyExistsException from "../exceptions/alreadyExistsException";
import DBException from "../exceptions/dbException";
import NotFoundException from "../exceptions/notFoundException";
import WrongCredentialsException from "../exceptions/wrongCredentialsException";
import MissingRequiredDataException from "../exceptions/missingRequiredDataException";
import { Request, Response } from "express";
import ForbiddenException from "../exceptions/forbiddenException";
import Jwt from "../config/jwt";
import logger from "../config/logger";

export default class AuthController {

    static TOKEN_EXPIRATION: number = 60 * 60; // 1 hour in seconds
    static async signUp(req: Request, res: Response) {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        try {
            await AuthService.signUp(name, email, password);
            res.status(201).json({ message: "User created successfully" });
        } catch (error) {
            logger.error(`Error in signUp: ${error instanceof Error ? error.message : 'Unknown error'}`);
            if (error instanceof AlreadyExistsException) {
                res.status(error.statusCode).json({ message: error.message });
            } else if (error instanceof DBException) {
                res.status(error.statusCode).json({ message: "Internal server error" });
            } else if (error instanceof MissingRequiredDataException) {
                res.status(error.statusCode).json({ message: error.message });
            } else if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(400).json({ message: "An unknown error occurred" });
            }
        }
    }


    static async login(req: Request, res: Response) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        try {

            const token = await AuthService.login(email, password);

            res.cookie("accessToken", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 1000 * AuthController.TOKEN_EXPIRATION, // 1 hour
            });

            res.status(200).json({ message: "Login successful" });
        } catch (error) {
            logger.error(`Error in login: ${error instanceof Error ? error.message : 'Unknown error'}`);
            if (error instanceof WrongCredentialsException || error instanceof NotFoundException) {
                res.status(error.statusCode).json({ message: "Invalid email or password" });
            } else if (error instanceof DBException) {
                res.status(error.statusCode).json({ message: "Internal server error" });
            } else if (error instanceof MissingRequiredDataException) {
                res.status(error.statusCode).json({ message: error.message });
            } else if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(400).json({ message: "An unknown error occurred" });
            }
        }
    }

    static async confirmEmail(req: Request, res: Response) {
        const { userId, tokenPurpose } = req;

        if (!userId || tokenPurpose !== "emailConfirmation") {
            throw new ForbiddenException("Invalid token");
        }

        try {

            await AuthService.confirmEmail(userId);
            res.status(200).json({ message: "Email confirmed successfully" });

        } catch (error) {
            logger.error(`Error in confirmEmail: ${error instanceof Error ? error.message : 'Unknown error'}`);
            if (error instanceof ForbiddenException) {
                res.status(error.statusCode).json({ message: error.message });
            } else if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(400).json({ message: "An unknown error occurred" });
            }
        }
    }

    static async getConfirmationLink(req: Request, res: Response) {
        const { email } = req.query;

        if (!email || typeof email !== "string") {
            return res.status(400).json({ message: "Email is required" });
        }

        try {
            await AuthService.getConfirmationLink(email);
            res.status(200).json({ message: "If an account with that email exists, a confirmation link has been sent." });
        } catch (error) {
            logger.error(`Error in getConfirmationLink: ${error instanceof Error ? error.message : 'Unknown error'}`);
            if ((error as AlreadyExistsException).statusCode === 409 && (error as Error).message === "Confirmation link was sent recently. Please check your email.") {
                res.status(409).json({ message: (error as Error).message });
            } else if (error instanceof NotFoundException) {
                res.status(200).json({ message: "If an account with that email exists, a confirmation link has been sent." });
            } else if (error instanceof AlreadyExistsException) {
                res.status(error.statusCode).json({ message: error.message });
            } else if (error instanceof DBException) {
                res.status(error.statusCode).json({ message: "Internal server error" });
            } else if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(400).json({ message: "An unknown error occurred" });
            }
        }
    }

    static async resetPassword(req: Request, res: Response) {
        const { password } = req.body;
        const { userId, tokenPurpose } = req;

        if (!userId || tokenPurpose !== "passwordReset") {
            throw new ForbiddenException("Invalid token purpose");
        }

        if (!password || typeof password !== "string") {
            return res.status(400).json({ message: "New password is required" });
        }

        try {
            await AuthService.resetPassword(password, userId);
            res.status(200).json({ message: "Password reset successfully" });
        } catch (error) {
            logger.error(`Error in resetPassword: ${error instanceof Error ? error.message : 'Unknown error'}`);
            if (error instanceof NotFoundException) {
                res.status(error.statusCode).json({ message: error.message });
            } else if (error instanceof DBException) {
                res.status(error.statusCode).json({ message: "Internal server error" });
            } else if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(400).json({ message: "An unknown error occurred" });
            }
        }
    }

    static async getResetPasswordLink(req: Request, res: Response) {
        const { email } = req.query;

        if (!email || typeof email !== "string") {
            return res.status(400).json({ message: "Email is required" });
        }
        try {
            await AuthService.getResetPasswordLink(email);
            res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
        } catch (error) {
            logger.error(`Error in getResetPasswordLink: ${error instanceof Error ? error.message : 'Unknown error'}`);
            if (error instanceof AlreadyExistsException) {
                res.status(409).json({ message: error.message });
            } else if (error instanceof NotFoundException || error instanceof WrongCredentialsException) {
                res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
            } else if (error instanceof DBException) {
                res.status(error.statusCode).json({ message: "Internal server error" });
            } else if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(400).json({ message: "An unknown error occurred" });
            }
        }
    }

    static async checkAuthentication(req: Request, res: Response) {
        const token = req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        try {
            const tokenData = Jwt.verifyToken(token);
            if (!tokenData) {
                return res.status(403).json({ message: "Not authenticated" });
            }
            res.status(200).json({ message: "Authenticated", userId: tokenData.id });
        } catch (error) {
            logger.error(`Error in checkAuthentication: ${error instanceof Error ? error.message : 'Unknown error'}`);
            res.status(403).json({ message: "Not authenticated" });
        }
    }

    static async logout(req: Request, res: Response) {
        try {
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
            res.status(200).json({ message: "Logged out successfully" });
        } catch (error) {
            logger.error(`Error in logout: ${error instanceof Error ? error.message : 'Unknown error'}`);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}