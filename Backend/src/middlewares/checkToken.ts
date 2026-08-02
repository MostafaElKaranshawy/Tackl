import Jwt from "../config/jwt";

export default async function checkToken(req: any, res: any, next: any) {
    const token = req.cookies.accessToken || req.headers.authorization?.split("Bearer ")[1];
    
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const tokenData = Jwt.verifyToken(token);
        if (!tokenData) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        req.userId = tokenData.id;
        req.tokenPurpose = tokenData.purpose;

        next();
    } catch (error) {
        console.error("Error in checkUser middleware:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}