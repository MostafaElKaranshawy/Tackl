import AuthService from "../services/authService";
import AlreadyExistsException from "../exceptions/alreadyExistsException";
import DBException from "../exceptions/dbException";
import NotFoundException from "../exceptions/notFoundException";
import WrongCredentialsException from "../exceptions/wrongCredentialsException";
import MissingRequiredDataException from "../exceptions/missingRequiredDataException";
import { Request, Response } from "express";
export default class AuthController {

    static TOKEN_EXPIRATION: number = 60 * 60; // 1 hour in seconds
    static async signUp(req: Request, res: Response) {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        try {
            const user = await AuthService.signUp(name, email, password);
            res.status(201).json({ message: "User created successfully", user });
        } catch (error: any) {
            if (error instanceof AlreadyExistsException) {
                res.status(error.statusCode).json({ message: error.message });
            } else if (error instanceof DBException) {
                res.status(error.statusCode).json({ message: "Internal server error" });
            } else if (error instanceof NotFoundException) {
                res.status(error.statusCode).json({ message: error.message });
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

            if (error instanceof WrongCredentialsException) {
                res.status(error.statusCode).json({ message: error.message });
            } else if (error instanceof NotFoundException) {
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

}