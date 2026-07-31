import UserRepository from "../repositories/userRepo";
import bcrypt from "bcrypt";
import Jwt from "../config/jwt";
import { randomInt } from "crypto";
import User from "../models/user";
import DBException from "../exceptions/dbException";
import WrongCredentialsException from "../exceptions/wrongCredentialsException";
import NotFoundException from "../exceptions/notFoundException";
import EmailService from "./emailService";
import AlreadyExistsException from "../exceptions/alreadyExistsException";

export default class AuthService {

    static async signUp(name: string, email: string, password: string): Promise<void> {

        const passwordSalt = randomInt(1, 15);

        const hashedPassword = await bcrypt.hash(password, passwordSalt);
        try {
            const user = await UserRepository.createUser(name, email, hashedPassword);
            const confirmationToken = Jwt.generateToken({ id: user.id, confirmation: true });
            const confirmationLink = `${process.env.FRONTEND_LINK}/confirm-email?token=${confirmationToken}`;

            await EmailService.sendEmail(email, "Welcome to Our Service", `Hello ${name},\n\nThank you for signing up! We're excited to have you on board. \n\n Use the following link to confirm your email: ${confirmationLink}\n\nBest regards,\nThe Team`);
        } catch (error) {
            throw error;
        }
    }


    static async login(email: string, password: string): Promise<string> {
        try {
            const user = await UserRepository.getUserByEmail(email);

            if (!user) {
                throw new WrongCredentialsException("Invalid email or password");
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new WrongCredentialsException("Invalid email or password");
            }

            if (!user.confirmed) {
                throw new WrongCredentialsException("Email not confirmed. Please check your inbox for the confirmation email.");
            }

            const token = Jwt.generateToken({ id: user.id, email: user.email });
            // await EmailService.sendEmail(email, "Welcome to Our Service", `Hello ${user.name},\n\nA new login was detected on your account.\n\nBest regards,\n\n\nTackl Team`);
            console.log(token);
            return token;

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new WrongCredentialsException("Invalid email or password", 401);
            } else if (error instanceof WrongCredentialsException) {
                throw error;
            }
            else {
                throw new DBException("Error during login", 500);
            }
        }
    }
    static async confirmEmail(userId: string): Promise<void> {
        try {
            await UserRepository.confirmUserEmail(userId);
        } catch (error) {
            throw error;
        }
    }

    static async getConfirmationLink(email: string): Promise<void> {
        try {
            const user = await UserRepository.getUserByEmail(email);
            if (!user) {
                throw new NotFoundException("User not found", 404);
            }
            if (user.confirmed) {
                throw new AlreadyExistsException("Email is already confirmed", 400);
            }
            if (user.lastLinkTime) {
                const timeSinceLastLink = Date.now() - user.lastLinkTime.getTime();
                const oneHourInMilliseconds = 60 * 60 * 1000;
                if (timeSinceLastLink < oneHourInMilliseconds) {
                    throw new AlreadyExistsException("Confirmation link was sent recently. Please check your email.", 409);
                }
            }
            await UserRepository.updateUser(user.id, { lastLinkTime: new Date() });
            const confirmationToken = Jwt.generateToken({ id: user.id, confirmation: true }, '30m');
            const confirmationLink = `${process.env.FRONTEND_LINK}/confirm-email/${confirmationToken}`;
            await EmailService.sendEmail(email, "Email Confirmation", `Hello ${user.name},\n\nPlease confirm your email by clicking the following link: ${confirmationLink}\n\nBest regards,\nThe Team`);
        } catch (error) {
            throw error;
        }
    }

    static async resetPassword(password: string, userId: string): Promise<void> {
        try {

            const user = await UserRepository.getUserById(userId);
            if (!user) {
                throw new NotFoundException("User not found", 404);
            }

            const passwordSalt = randomInt(1, 15);
            const hashedPassword = await bcrypt.hash(password, passwordSalt);

            await UserRepository.updateUser(user.id, { password: hashedPassword });
        } catch (error) {
            console.error("Error in resetPassword:", error); // Debugging line
            throw error;
        }
    }

    static async getResetPasswordLink(email: string): Promise<string> {
        const user = await UserRepository.getUserByEmail(email);
        if (!user) {
            throw new NotFoundException("User not found", 404);
        }
        if (user.lastLinkTime) {
            const timeSinceLastLink = Date.now() - user.lastLinkTime.getTime();
            const oneHourInMilliseconds = 60 * 60 * 1000;
            if (timeSinceLastLink < oneHourInMilliseconds) {
                throw new AlreadyExistsException("Confirmation link was sent recently. Please check your email.", 409);
            }
        }

        await UserRepository.updateUser(user.id, { lastLinkTime: new Date() });
        const resetToken = Jwt.generateToken({ id: user.id, resetPassword: true }, '30m');

        const resetLink = `${process.env.FRONTEND_LINK}/reset-password/${resetToken}`;

        EmailService.sendEmail(email, "Password Reset Request", `Hello ${user.name},\n\nYou requested a password reset. Please use the following link to reset your password: ${resetLink}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe Team`);
        return resetLink;
    }
}