import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import nameValidator from "../../src/middlewares/nameValidator";

describe("nameValidator", () => {
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

    it("should return 400 when name is missing", async () => {
        await nameValidator(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Name is required",
        });
    });

    it("should return 400 when name is an empty string", async () => {
        req.body = {
            name: "",
        };

        await nameValidator(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Name is required",
        });
    });

    it("should return 400 when name contains numbers", async () => {
        req.body = {
            name: "John123",
        };

        await nameValidator(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Name must contain only letters and spaces",
        });
    });

    it("should return 400 when name contains special characters", async () => {
        req.body = {
            name: "John@Doe",
        };

        await nameValidator(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Name must contain only letters and spaces",
        });
    });

    it("should return 400 when name contains multiple consecutive spaces", async () => {
        req.body = {
            name: "John  Doe",
        };

        await nameValidator(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Name must contain only letters and spaces",
        });
    });

    it("should return 400 when name starts with a space after trimming if it contains other invalid spacing", async () => {
        req.body = {
            name: "John  Doe",
        };

        await nameValidator(
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Name must contain only letters and spaces",
        });
    });

    it("should trim leading and trailing spaces", async () => {
        req.body = {
            name: "  John Doe  ",
        };

        await nameValidator(
            req as Request,
            res as Response,
            next
        );

        expect(req.body.name).toBe("John Doe");
        expect(next).toHaveBeenCalled();
    });

    it("should accept a single name", async () => {
        req.body = {
            name: "John",
        };

        await nameValidator(
            req as Request,
            res as Response,
            next
        );

        expect(req.body.name).toBe("John");
        expect(next).toHaveBeenCalled();
    });

    it("should accept a full name", async () => {
        req.body = {
            name: "John Doe",
        };

        await nameValidator(
            req as Request,
            res as Response,
            next
        );

        expect(req.body.name).toBe("John Doe");
        expect(next).toHaveBeenCalled();
    });

    it("should accept multiple names separated by single spaces", async () => {
        req.body = {
            name: "John Michael Doe",
        };

        await nameValidator(
            req as Request,
            res as Response,
            next
        );

        expect(req.body.name).toBe("John Michael Doe");
        expect(next).toHaveBeenCalled();
    });

    it("should modify req.body.name with the trimmed value", async () => {
        req.body = {
            name: "   John Doe   ",
        };

        await nameValidator(
            req as Request,
            res as Response,
            next
        );

        expect(req.body.name).toBe("John Doe");
        expect(next).toHaveBeenCalled();
    });
});