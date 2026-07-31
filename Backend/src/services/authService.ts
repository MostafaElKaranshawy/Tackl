import UserRepository from "../repositories/userRepo";
import bcrypt from "bcrypt";
import Jwt from "../config/jwt";
import { randomInt } from "crypto";
import User from "../models/user";
import DBException from "../exceptions/dbException";
import WrongCredentialsException from "../exceptions/wrongCredentialsException";
import NotFoundException from "../exceptions/notFoundException";

export default class AuthService {

    static async signUp(name: string, email: string, password: string): Promise<User> {

        const passwordSalt = randomInt(1, 15);

        const hashedPassword = await bcrypt.hash(password, passwordSalt);
        try {
            const user = await UserRepository.createUser(name, email, hashedPassword);
            return user;
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

            const token = Jwt.generateToken({ id: user.id, email: user.email });
            return token;

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof WrongCredentialsException) {
                throw new WrongCredentialsException("Invalid email or password", 401);
            } else {
                throw new DBException("Error during login", 500);
            }
        }
    }
}