import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextFunction, Request, Response } from "express";
import passwordValidator from "../../src/middlewares/passwordValidator";

describe("passwordValidator", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

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

    it("should return 400 when password is missing", async () => {
        await passwordValidator(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Password is required",
        });
    });

    it("should return 400 when password is empty", async () => {
        req.body = {
            password: "",
        };

        await passwordValidator(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Password is required",
        });
    });

    it("should return 400 when password is shorter than 8 characters", async () => {
        req.body = {
            password: "Ab1!",
        };

        await passwordValidator(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Password must be at least 8 characters long",
        });
    });

    it("should return 400 when password has no uppercase letter", async () => {
        req.body = {
            password: "password1!",
        };

        await passwordValidator(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Password must contain at least one uppercase letter",
        });
    });

    it("should return 400 when password has no lowercase letter", async () => {
        req.body = {
            password: "PASSWORD1!",
        };

        await passwordValidator(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Password must contain at least one lowercase letter",
        });
    });

    it("should return 400 when password has no number", async () => {
        req.body = {
            password: "Password!",
        };

        await passwordValidator(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Password must contain at least one number",
        });
    });

    it("should return 400 when password has no special character", async () => {
        req.body = {
            password: "Password1",
        };

        await passwordValidator(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Password must contain at least one special character",
        });
    });

    it("should call next when password satisfies all requirements", async () => {
        req.body = {
            password: "Password1!",
        };

        await passwordValidator(
            req as Request,
            res as Response,
            next
        );

        expect(next).toHaveBeenCalled();
    });

    it("should accept a password with multiple special characters", async () => {
        req.body = {
            password: "Password1!@#$",
        };

        await passwordValidator(
            req as Request,
            res as Response,
            next
        );

        expect(next).toHaveBeenCalled();
    });

    it("should accept a password exactly 8 characters long", async () => {
        req.body = {
            password: "Pass1!a@",
        };

        await passwordValidator(
            req as Request,
            res as Response,
            next
        );

        expect(next).toHaveBeenCalled();
    });
});