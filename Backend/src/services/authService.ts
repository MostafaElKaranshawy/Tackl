import UserRepository from "../repositories/userRepo";
import bcrypt from "bcrypt";

import { randomInt } from "crypto";

export default class AuthService {

    constructor(private userRepository: UserRepository) {}
    
    static async signUp(name: string, email: string, password: string) {
        
        const passwordSalt = randomInt(1, 15);

        const hashedPassword = await bcrypt.hash(password, passwordSalt);
        try {
            const user = await UserRepository.createUser(name, email, hashedPassword);
            return user;
        } catch (error) {
            throw error;
        }
    }
}