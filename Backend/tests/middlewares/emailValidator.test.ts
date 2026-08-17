import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response } from "express";
import emailValidator from "../../src/middlewares/emailValidator";

describe("emailValidator middleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: () => void;

    beforeEach(() => {
        req = {
            body: {},
        };

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };

        next = vi.fn();
    });

    it("should return 400 when email is missing", async () => {
        await emailValidator(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Email is required",
        });
    });

    it("should return 400 when email is invalid", async () => {
        req.body = {
            email: "invalid-email",
        };

        await emailValidator(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid email format",
        });
    });

    it("should return 400 when email has no domain", async () => {
        req.body = {
            email: "user@",
        };

        await emailValidator(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid email format",
        });
    });

    it("should return 400 when email has no username", async () => {
        req.body = {
            email: "@example.com",
        };

        await emailValidator(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid email format",
        });
    });

    it("should call next for a valid email", async () => {
        req.body = {
            email: "user@example.com",
        };

        await emailValidator(
            req as Request,
            res as Response,
            next
        );

        expect(next).toHaveBeenCalled();
    });

    it("should accept an email with subdomain", async () => {
        req.body = {
            email: "user@mail.example.com",
        };

        await emailValidator(
            req as Request,
            res as Response,
            next
        );

        expect(next).toHaveBeenCalled();
    });
});