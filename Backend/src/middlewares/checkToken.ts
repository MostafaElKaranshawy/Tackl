import Jwt from "../config/jwt";
import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

export default function checkToken(req: Request, res: Response, next: NextFunction) {
    const cookieToken = req.cookies?.accessToken;

    const authHeader = req.headers.authorization;
    const bearerToken =
        authHeader?.startsWith("Bearer ")
            ? authHeader.substring(7)
            : undefined;

    const token = cookieToken || bearerToken;

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    try {
        const tokenData = Jwt.verifyToken(token);

        if (!tokenData) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        req.userId = tokenData.id;
        req.tokenPurpose = tokenData.purpose;

        next();
    } catch (error) {
        logger.error("Error in checkToken middleware:", error);

        return res.status(401).json({
            message: "Unauthorized",
        });
    }
}