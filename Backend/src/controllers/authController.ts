import AuthService from "../services/authService";
import AlreadyExistsException from "../exceptions/alreadyExistsException";
import DBException from "../exceptions/dbException";
import NotFoundException from "../exceptions/notFoundException";
import WrongCredentialsException from "../exceptions/wrongCredentialsException";
import MissingRequiredDataException from "../exceptions/missingRequiredDataException";
import { Request, Response } from "express";
import ForbiddenException from "../exceptions/forbiddenException";
import Jwt from "../config/jwt";

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
        } catch (error: any) {
            if (error instanceof AlreadyExistsException) {
                res.status(error.statusCode).json({ message: error.message });
            } else if (error instanceof DBException) {
                res.status(error.statusCode).json({ message: "Internal server error" });
            } else if (error instanceof MissingRequiredDataException) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
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
        } catch (error: any) {
            if (error instanceof WrongCredentialsException || error instanceof NotFoundException) {
                res.status(error.statusCode).json({ message: "Invalid email or password" });
            } else if (error instanceof DBException) {
                res.status(error.statusCode).json({ message: "Internal server error" });
            } else if (error instanceof MissingRequiredDataException) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    static async confirmEmail(req: Request, res: Response) {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        try {

            await AuthService.confirmEmail(userId);
            res.status(200).json({ message: "Email confirmed successfully" });

        } catch (error: any) {
            if (error instanceof ForbiddenException) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
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
        } catch (error: any) {
            if (error.statusCode === 409 && error.message === "Confirmation link was sent recently. Please check your email.") {
                res.status(409).json({ message: error.message });
            } else if (error instanceof NotFoundException) {
                res.status(200).json({ message: "If an account with that email exists, a confirmation link has been sent." });
            } else if (error instanceof AlreadyExistsException) {
                res.status(error.statusCode).json({ message: error.message });
            } else if (error instanceof DBException) {
                res.status(error.statusCode).json({ message: "Internal server error" });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    static async resetPassword(req: Request, res: Response) {
        const { password } = req.body;
        let userId = req.userId;
        if (!userId) {
            const { token } = req.query;

            if (!token || typeof token !== "string") {
                return res.status(400).json({ message: "Confirmation token is required" });
            }

            try {
                userId = Jwt.extractIdFromToken(token);
            } catch (error) {
                return res.status(400).json({ message: "Invalid or expired token" });
            }
        }

        if (!password || typeof password !== "string") {
            return res.status(400).json({ message: "New password is required" });
        }


        try {
            await AuthService.resetPassword(password, userId);
            res.status(200).json({ message: "Password reset successfully" });
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                res.status(error.statusCode).json({ message: error.message });
            } else if (error instanceof DBException) {
                res.status(error.statusCode).json({ message: "Internal server error" });
            } else {
                res.status(400).json({ message: error.message });
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
        } catch (error: any) {
            if (error instanceof AlreadyExistsException) {
                res.status(409).json({ message: error.message });
            } else if (error instanceof NotFoundException || error instanceof WrongCredentialsException) {
                res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
            } else if (error instanceof DBException) {
                res.status(error.statusCode).json({ message: "Internal server error" });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}