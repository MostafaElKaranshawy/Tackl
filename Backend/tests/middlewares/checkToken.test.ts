import { Request, Response, NextFunction } from "express";
import { describe, it, expect, beforeEach, vi } from "vitest";
import checkToken from "../../src/middlewares/checkToken";
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

describe("checkToken middleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            cookies: {},
            headers: {},
        };

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };

        next = vi.fn();

        vi.clearAllMocks();
    });

    it("should return 401 when no token is provided", () => {
        checkToken(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Unauthorized",
        });
    });

    it("should authenticate using the cookie token", () => {
        req.cookies = {
            accessToken: "cookie-token",
        };

        vi.mocked(Jwt.verifyToken).mockReturnValue({
            id: "user-123",
            purpose: "access",
        });

        checkToken(
            req as Request,
            res as Response,
            next
        );

        expect(Jwt.verifyToken).toHaveBeenCalledWith("cookie-token");
        expect(req.userId).toBe("user-123");
        expect(req.tokenPurpose).toBe("access");
        expect(next).toHaveBeenCalled();
    });

    it("should authenticate using the Bearer token", () => {
        req.headers = {
            authorization: "Bearer bearer-token",
        };

        vi.mocked(Jwt.verifyToken).mockReturnValue({
            id: "user-456",
            purpose: "passwordReset",
        });

        checkToken(
            req as Request,
            res as Response,
            next
        );

        expect(Jwt.verifyToken).toHaveBeenCalledWith("bearer-token");
        expect(req.userId).toBe("user-456");
        expect(req.tokenPurpose).toBe("passwordReset");
        expect(next).toHaveBeenCalled();
    });

    it("should prefer the cookie token when both tokens are provided", () => {
        req.cookies = {
            accessToken: "cookie-token",
        };

        req.headers = {
            authorization: "Bearer bearer-token",
        };

        vi.mocked(Jwt.verifyToken).mockReturnValue({
            id: "user-123",
            purpose: "access",
        });

        checkToken(
            req as Request,
            res as Response,
            next
        );

        expect(Jwt.verifyToken).toHaveBeenCalledWith("cookie-token");
        expect(req.userId).toBe("user-123");
        expect(req.tokenPurpose).toBe("access");
        expect(next).toHaveBeenCalled();
    });

    it("should return 401 when verifyToken returns null", () => {
        req.cookies = {
            accessToken: "invalid-token",
        };

        vi.mocked(Jwt.verifyToken).mockReturnValue(null);

        checkToken(
            req as Request,
            res as Response,
            next
        );

        expect(Jwt.verifyToken).toHaveBeenCalledWith("invalid-token");
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Unauthorized",
        });
    });

    it("should log the error and return 401 when verifyToken throws", () => {
        const error = new Error("Invalid token");

        req.cookies = {
            accessToken: "invalid-token",
        };

        vi.mocked(Jwt.verifyToken).mockImplementation(() => {
            throw error;
        });

        checkToken(
            req as Request,
            res as Response,
            next
        );

        expect(logger.error).toHaveBeenCalledWith(
            "Error in checkToken middleware:",
            error
        );

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Unauthorized",
        });
    });

    it("should return 401 when authorization header is not Bearer", () => {
        req.headers = {
            authorization: "Basic some-token",
        };

        checkToken(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Unauthorized",
        });
    });

    it("should return 401 when authorization header is empty", () => {
        req.headers = {
            authorization: "",
        };

        checkToken(
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