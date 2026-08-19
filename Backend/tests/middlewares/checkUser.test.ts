import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response } from "express";
import checkUser from "../../src/middlewares/checkUser";
import Jwt from "../../src/config/jwt";
import logger from "../../src/config/logger";

vi.mock("../../src/config/jwt", () => ({
    default: {
        verifyToken: vi.fn(),
    },
}));

vi.mock("../../src/config/logger", () => ({
    default: {
        error: vi.fn(),
    },
}));

vi.mock("../../src/repositories/userRepository", () => ({
    default: {
        getUserById: vi.fn().mockResolvedValue({ id: "user-123" }),
    },
}));
describe("checkUser middleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: () => void;

    beforeEach(() => {
        req = {
            cookies: {},
            headers: {},
        };

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            clearCookie: vi.fn().mockReturnThis(),
        };

        next = vi.fn();

        vi.clearAllMocks();
    });

    it("should return 401 when no token is provided", async () => {
        await checkUser(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Unauthorized",
        });
    });

    it("should authenticate using the cookie token", async () => {
        req.cookies = {
            accessToken: "cookie-token",
        };

        vi.mocked(Jwt.verifyToken).mockReturnValue({
            id: "user-123",
            purpose: "accessToken",
        });

        await checkUser(
            req as Request,
            res as Response,
            next
        );

        expect(Jwt.verifyToken).toHaveBeenCalledWith("cookie-token");

        expect(req.userId).toBe("user-123");
        expect(req.tokenPurpose).toBe("accessToken");

        expect(next).toHaveBeenCalled();
    });

    it("should authenticate using the Bearer token", async () => {
        req.headers = {
            authorization: "Bearer bearer-token",
        };

        vi.mocked(Jwt.verifyToken).mockReturnValue({
            id: "user-123",
            purpose: "accessToken",
        });

        await checkUser(
            req as Request,
            res as Response,
            next
        );

        expect(Jwt.verifyToken).toHaveBeenCalledWith("bearer-token");

        expect(req.userId).toBe("user-123");
        expect(req.tokenPurpose).toBe("accessToken");

        expect(next).toHaveBeenCalled();
    });

    it("should prefer the cookie token when both tokens are provided", async () => {
        req.cookies = {
            accessToken: "cookie-token",
        };

        req.headers = {
            authorization: "Bearer bearer-token",
        };

        vi.mocked(Jwt.verifyToken).mockReturnValue({
            id: "user-123",
            purpose: "accessToken",
        });

        await checkUser(
            req as Request,
            res as Response,
            next
        );

        expect(Jwt.verifyToken).toHaveBeenCalledWith("cookie-token");
        expect(next).toHaveBeenCalled();
    });

    it("should clear the cookie and return 401 when verifyToken returns null", async () => {
        req.cookies = {
            accessToken: "invalid-token",
        };

        vi.mocked(Jwt.verifyToken).mockReturnValue(null);

        await checkUser(
            req as Request,
            res as Response,
            next
        );

        expect(res.clearCookie).toHaveBeenCalledWith("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Unauthorized",
        });
    });

    it("should clear the cookie and return 403 when token purpose is invalid", async () => {
        req.cookies = {
            accessToken: "valid-token",
        };

        vi.mocked(Jwt.verifyToken).mockReturnValue({
            id: "user-123",
            purpose: "passwordReset",
        });

        await checkUser(
            req as Request,
            res as Response,
            next
        );

        expect(req.userId).toBe("user-123");
        expect(req.tokenPurpose).toBe("passwordReset");

        expect(res.clearCookie).toHaveBeenCalledWith("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "Forbidden",
        });
    });

    it("should clear the cookie and return 401 when verifyToken throws", async () => {
        const error = new Error("Invalid token");

        req.cookies = {
            accessToken: "invalid-token",
        };

        vi.mocked(Jwt.verifyToken).mockImplementation(() => {
            throw error;
        });

        await checkUser(
            req as Request,
            res as Response,
            next
        );

        expect(logger.error).toHaveBeenCalledWith(
            "Error in checkUser middleware:",
            error
        );

        expect(res.clearCookie).toHaveBeenCalledWith("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid token",
        });
    });

    it("should return 401 when authorization header is not a Bearer token", async () => {
        req.headers = {
            authorization: "Basic some-token",
        };

        await checkUser(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Unauthorized",
        });
    });
});