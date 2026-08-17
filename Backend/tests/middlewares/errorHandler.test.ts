import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../../src/middlewares/errorHandler";
import logger from "../../src/config/logger";
import EmailAlreadyConfirmedException from "../../src/exceptions/emailAlreadyConfirmed";
import AlreadyExistsException from "../../src/exceptions/alreadyExistsException";
import DBException from "../../src/exceptions/dbException";
import ForbiddenException from "../../src/exceptions/forbiddenException";
import MissingRequiredDataException from "../../src/exceptions/missingRequiredDataException";
import WrongCredentialsException from "../../src/exceptions/wrongCredentialsException";
import NotFoundException from "../../src/exceptions/notFoundException";

vi.mock("../../src/config/logger", () => ({
    default: {
        error: vi.fn(),
    },
}));

describe("ErrorHandler", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {};

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };

        next = vi.fn();

        vi.clearAllMocks();
    });

    it("should handle EmailAlreadyConfirmedException", () => {
        const error = new EmailAlreadyConfirmedException(
            "Email already confirmed"
        );

        ErrorHandler(
            error,
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(error.statusCode);

        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            statusCode: error.statusCode,
            message: "Email is already confirmed, login instead",
        });

        expect(logger.error).toHaveBeenCalled();
    });

    it("should handle AlreadyExistsException", () => {
        const error = new AlreadyExistsException(
            "Email already exists"
        );

        ErrorHandler(
            error,
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(error.statusCode);

        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            statusCode: error.statusCode,
            message: "Resource already exists",
        });
    });

    it("should handle DBException", () => {
        const error = new DBException(
            "Database error"
        );

        ErrorHandler(
            error,
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(error.statusCode);

        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            statusCode: error.statusCode,
            message: "Internal Server Error",
        });
    });

    it("should handle ForbiddenException", () => {
        const error = new ForbiddenException(
            "Access denied"
        );

        ErrorHandler(
            error,
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(error.statusCode);

        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            statusCode: error.statusCode,
            message: "Forbidden",
        });
    });

    it("should handle MissingRequiredDataException", () => {
        const error = new MissingRequiredDataException(
            "Missing data"
        );

        ErrorHandler(
            error,
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(error.statusCode);

        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            statusCode: error.statusCode,
            message: "Missing required data",
        });
    });

    it("should handle WrongCredentialsException", () => {
        const error = new WrongCredentialsException(
            "Invalid credentials"
        );

        ErrorHandler(
            error,
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(error.statusCode);

        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            statusCode: error.statusCode,
            message: "Wrong credentials",
        });
    });

    it("should handle NotFoundException", () => {
        const error = new NotFoundException(
            "User not found"
        );

        ErrorHandler(
            error,
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(error.statusCode);

        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            statusCode: error.statusCode,
            message: "Resource not found",
        });
    });

    it("should handle a non-Error value", () => {
        const error = "Something went wrong";

        ErrorHandler(
            error,
            req as Request,
            res as Response,
            next
        );

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            statusCode: 500,
            message: "An error occurred",
        });
    });

    it("should log the error message and stack", () => {
        const error = new Error("Something failed");

        ErrorHandler(
            error,
            req as Request,
            res as Response,
            next
        );

        expect(logger.error).toHaveBeenCalledWith(
            `Error: ${error.message}, Stack: ${error.stack}`
        );
    });
});