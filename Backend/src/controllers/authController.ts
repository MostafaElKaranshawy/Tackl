import AuthService from "../services/authService";
import AlreadyExistsException from "../exceptions/alreadyExistsException";
import DBException from "../exceptions/dbException";
import NotFoundException from "../exceptions/notFoundException";

export default class AuthController {

    static async signUp(req: any, res: any) {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        try {
            const user = await AuthService.signUp(name, email, password);
            res.status(201).json({ message: "User created successfully", user });
        } catch (error: any) {
            if(error instanceof AlreadyExistsException) {
                res.status(409).json({ message: error.message });
            } else if(error instanceof DBException) {
                res.status(500).json({ message: "Internal server error" });
            } else if(error instanceof NotFoundException) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

}