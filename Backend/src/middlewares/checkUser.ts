import Jwt from "../config/jwt";
import { Request, Response } from "express";
import logger from "../config/logger";
import UserRepository from "../repositories/userRepository";

export default async function checkUser(req: Request, res: Response, next: () => void) {
    const token = req.cookies.accessToken || req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const tokenData = Jwt.verifyToken(token);
        if (!tokenData) {
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
            return res.status(401).json({ message: "Unauthorized" });
        }
        UserRepository.getUserById(tokenData.id).then((user) => {
            if (!user) {
                res.clearCookie("accessToken", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                });
                return res.status(401).json({ message: "Unauthorized" });
            }
        });
        req.userId = tokenData.id;
        req.tokenPurpose = tokenData.purpose;

        if (req.tokenPurpose !== "accessToken") {
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    } catch (error) {
        logger.error("Error in checkUser middleware:", error);
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        return res.status(401).json({ message: "Invalid token" });
    }
}