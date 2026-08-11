import Jwt from "../config/jwt";
import { NextFunction, Request, Response } from "express";
import logger from "../config/logger";

export default async function checkToken(req: Request, res: Response, next: NextFunction) {
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
        logger.error("Error in checkToken middleware:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}