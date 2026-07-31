import Jwt from "../config/jwt";
import UserRepository from "../repositories/userRepo";

export default async function checkUser(req: any, res: any, next: any) {
    const token = req.cookies.accessToken || req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const { id: userId, email } = Jwt.verifyToken(token);
        if (!userId || !email) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await UserRepository.getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.userId = userId;
        next();
    } catch (error) {
        console.error("Error in checkUser middleware:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}