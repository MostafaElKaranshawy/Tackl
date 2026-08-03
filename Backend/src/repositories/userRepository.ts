import User from "../models/user";
import NotFoundException from "../exceptions/notFoundException";
import AlreadyExistsException from "../exceptions/alreadyExistsException";
import DBException from "../exceptions/dbException";

export default class UserRepository {

    static async createUser(name: string, email: string, password: string): Promise<User> {
        // check email uniqueness
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            throw new AlreadyExistsException("Email already exists");
        }
        try {
            const user = await User.create({ name, email, password });
            return user;

        } catch (error) {
            throw new DBException("Error creating user");
        }
    }

    static async getUserById(id: string): Promise<User> {
        const user = await User.findByPk(id);
        if (!user) {
            throw new NotFoundException("User not found");
        }
        return user;
    }

    static async getUserByEmail(email: string): Promise<User> {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException("User not found");
        }
        return user;
    }

    static async confirmUserEmail(id: string): Promise<void> {
        const user = await User.findByPk(id);
        if (!user) {
            throw new NotFoundException("User not found");
        }
        try {
            user.confirmed = true;
            await user.save();
        } catch (error) {
            throw new DBException("Error confirming user email");
        }
    }

    static async updateUser(id: string, updates: Partial<{ name: string; email: string; password: string, confirmed: boolean, lastLinkTime: Date }>): Promise<User> {
        const user = await User.findByPk(id);
        if (!user) {
            throw new NotFoundException("User not found");
        }
        try {
            await user.update(updates);
            return user;
        } catch (error) {
            throw new DBException("Error updating user");
        }
    }

    static async deleteUser(id: string): Promise<void> {
        const user = await User.findByPk(id);
        if (!user) {
            throw new NotFoundException("User not found");
        }
        try {
            await user.destroy();
        } catch (error) {
            throw new DBException("Error deleting user");
        }
    }
}