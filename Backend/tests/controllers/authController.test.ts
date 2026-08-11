import { afterEach, assert, describe, expect, it, vi } from "vitest";
import AuthController from "../../src/controllers/authController";
import AuthService from "../../src/services/authService";
import Jwt from "../../src/config/jwt";
import WrongCredentialsException from "../../src/exceptions/wrongCredentialsException";
import NotFoundException from "../../src/exceptions/notFoundException";

describe("AuthController", () => {

    afterEach(() => {
        vi.restoreAllMocks();
    });


    it("Sign up with valid data", async () => {

        const req = {
            body: {
                name: "Mostafa",
                email: "test@example.com",
                password: "Mostafa1#",
            },
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        vi.spyOn(AuthService, "signUp").mockResolvedValue();

        await AuthController.signUp(req, res, next);

        expect(AuthService.signUp).toHaveBeenCalledWith(
            "Mostafa",
            "test@example.com",
            "Mostafa1#"
        );

        expect(res.status).toHaveBeenCalledWith(201);

        expect(res.json).toHaveBeenCalledWith({
            message: "User created successfully",
        });
    });


    it("Sign up without required data", async () => {

        const req = {
            body: {
                name: "Mostafa",
                email: "test@example.com",
            },
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        await AuthController.signUp(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "Name, email, and password are required",
        });

    });


    it("Sign up handles service error", async () => {

        const error = new Error("Database error");

        const req = {
            body: {
                name: "Mostafa",
                email: "test@example.com",
                password: "Mostafa1#",
            },
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        vi.spyOn(AuthService, "signUp")
            .mockRejectedValue(error);

        await AuthController.signUp(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });


    it("Login with valid credentials", async () => {

        const req = {
            body: {
                email: "test@example.com",
                password: "Mostafa1#",
            },
        } as any;

        const res = {
            cookie: vi.fn(),
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        vi.spyOn(AuthService, "login")
            .mockResolvedValue("mocked-jwt-token");

        await AuthController.login(req, res, next);

        expect(AuthService.login).toHaveBeenCalledWith(
            "test@example.com",
            "Mostafa1#"
        );

        expect(res.cookie).toHaveBeenCalledWith(
            "accessToken",
            "mocked-jwt-token",
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 1000 * AuthController.TOKEN_EXPIRATION,
            }
        );

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            message: "Login successful",
        });
    });


    it("Login without required data", async () => {

        const req = {
            body: {
                email: "test@example.com",
            },
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        await AuthController.login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "Email and password are required",
        });
    });


    it("Login with wrong credentials", async () => {

        const error = new WrongCredentialsException(
            "Invalid email or password"
        );

        const req = {
            body: {
                email: "test@example.com",
                password: "WrongPassword",
            },
        } as any;

        const res = {
            cookie: vi.fn(),
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        vi.spyOn(AuthService, "login")
            .mockRejectedValue(error);

        await AuthController.login(req, res, next);

        expect(next).toHaveBeenCalled();

        expect(next.mock.calls[0][0])
            .toBeInstanceOf(WrongCredentialsException);
    });


    it("Login with user not found", async () => {

        const error = new NotFoundException(
            "User not found"
        );

        const req = {
            body: {
                email: "test@example.com",
                password: "Mostafa1#",
            },
        } as any;

        const res = {
            cookie: vi.fn(),
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        vi.spyOn(AuthService, "login")
            .mockRejectedValue(error);

        await AuthController.login(req, res, next);

        expect(next).toHaveBeenCalled();

        expect(next.mock.calls[0][0])
            .toBeInstanceOf(WrongCredentialsException);
    });


    it("Confirm email successfully", async () => {

        const req = {
            userId: "user-1",
            tokenPurpose: "emailConfirmation",
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        vi.spyOn(AuthService, "confirmEmail")
            .mockResolvedValue();

        await AuthController.confirmEmail(req, res, next);

        expect(AuthService.confirmEmail)
            .toHaveBeenCalledWith("user-1");

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            message: "Email confirmed successfully",
        });
    });


    it("Confirm email with invalid token", async () => {

        const req = {
            userId: undefined,
            tokenPurpose: "emailConfirmation",
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        try {

            await AuthController.confirmEmail(req, res, next);

            assert.fail(
                "Expected ForbiddenException to be thrown"
            );

        } catch (error) {

            expect(error).toHaveProperty(
                "message",
                "Invalid token"
            );
        }
    });


    it("Confirm email with wrong token purpose", async () => {

        const req = {
            userId: "user-1",
            tokenPurpose: "passwordReset",
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        try {

            await AuthController.confirmEmail(req, res, next);

            assert.fail(
                "Expected ForbiddenException to be thrown"
            );

        } catch (error) {

            expect(error).toHaveProperty(
                "message",
                "Invalid token"
            );
        }
    });


    it("Get confirmation link successfully", async () => {

        const req = {
            query: {
                email: "test@example.com",
            },
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        vi.spyOn(AuthService, "getConfirmationLink")
            .mockResolvedValue();

        await AuthController.getConfirmationLink(
            req,
            res,
            next
        );

        expect(AuthService.getConfirmationLink)
            .toHaveBeenCalledWith("test@example.com");

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            message:
                "If an account with that email exists, a confirmation link has been sent.",
        });
    });


    it("Get confirmation link without email", async () => {

        const req = {
            query: {},
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        await AuthController.getConfirmationLink(
            req,
            res,
            next
        );

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "Email is required",
        });
    });


    it("Get confirmation link with non-existing email", async () => {

        const req = {
            query: {
                email: "unknown@example.com",
            },
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        vi.spyOn(AuthService, "getConfirmationLink")
            .mockRejectedValue(
                new NotFoundException("User not found")
            );

        await AuthController.getConfirmationLink(
            req,
            res,
            next
        );

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            message:
                "If an account with that email exists, a confirmation link has been sent.",
        });
    });


    it("Reset password successfully", async () => {

        const req = {
            body: {
                password: "NewPassword1#",
            },
            userId: "user-1",
            tokenPurpose: "passwordReset",
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        vi.spyOn(AuthService, "resetPassword")
            .mockResolvedValue();

        await AuthController.resetPassword(
            req,
            res,
            next
        );

        expect(AuthService.resetPassword)
            .toHaveBeenCalledWith(
                "NewPassword1#",
                "user-1"
            );

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            message: "Password reset successfully",
        });
    });


    it("Reset password with invalid token", async () => {

        const req = {
            body: {
                password: "NewPassword1#",
            },
            userId: undefined,
            tokenPurpose: "passwordReset",
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        try {

            await AuthController.resetPassword(
                req,
                res,
                next
            );

            assert.fail(
                "Expected ForbiddenException to be thrown"
            );

        } catch (error) {

            expect(error).toHaveProperty(
                "message",
                "Invalid token purpose"
            );
        }
    });


    it("Reset password with wrong token purpose", async () => {

        const req = {
            body: {
                password: "NewPassword1#",
            },
            userId: "user-1",
            tokenPurpose: "emailConfirmation",
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        try {

            await AuthController.resetPassword(
                req,
                res,
                next
            );

            assert.fail(
                "Expected ForbiddenException to be thrown"
            );

        } catch (error) {

            expect(error).toHaveProperty(
                "message",
                "Invalid token purpose"
            );
        }
    });


    it("Reset password without password", async () => {

        const req = {
            body: {},
            userId: "user-1",
            tokenPurpose: "passwordReset",
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        await AuthController.resetPassword(
            req,
            res,
            next
        );

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "New password is required",
        });
    });


    it("Get reset password link successfully", async () => {

        const req = {
            query: {
                email: "test@example.com",
            },
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        vi.spyOn(AuthService, "getResetPasswordLink")
            .mockResolvedValue("mocked-reset-link");

        await AuthController.getResetPasswordLink(
            req,
            res,
            next
        );

        expect(AuthService.getResetPasswordLink)
            .toHaveBeenCalledWith("test@example.com");

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            message:
                "If an account with that email exists, a password reset link has been sent.",
        });
    });


    it("Get reset password link without email", async () => {

        const req = {
            query: {},
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        await AuthController.getResetPasswordLink(
            req,
            res,
            next
        );

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "Email is required",
        });
    });


    it("Get reset password link handles service error", async () => {

        const error = new Error("Email service error");

        const req = {
            query: {
                email: "test@example.com",
            },
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        vi.spyOn(AuthService, "getResetPasswordLink")
            .mockRejectedValue(error);

        await AuthController.getResetPasswordLink(
            req,
            res,
            next
        );

        expect(next).toHaveBeenCalledWith(error);
    });


    it("Check authentication successfully", async () => {

        const req = {
            cookies: {
                accessToken: "valid-token",
            },
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        vi.spyOn(Jwt, "verifyToken")
            .mockReturnValue({
                id: "user-1",
            } as any);

        await AuthController.checkAuthentication(
            req,
            res,
            next
        );

        expect(Jwt.verifyToken)
            .toHaveBeenCalledWith("valid-token");

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            message: "Authenticated",
            userId: "user-1",
        });
    });


    it("Check authentication without token", async () => {

        const req = {
            cookies: {},
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        await AuthController.checkAuthentication(
            req,
            res,
            next
        );

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            message: "Not authenticated",
        });
    });


    it("Check authentication with invalid token", async () => {

        const req = {
            cookies: {
                accessToken: "invalid-token",
            },
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        vi.spyOn(Jwt, "verifyToken")
            .mockReturnValue(null);

        await AuthController.checkAuthentication(
            req,
            res,
            next
        );

        expect(res.status).toHaveBeenCalledWith(403);

        expect(res.json).toHaveBeenCalledWith({
            message: "Not authenticated",
        });
    });


    it("Check authentication handles JWT error", async () => {

        const error = new Error("Invalid token");

        const req = {
            cookies: {
                accessToken: "invalid-token",
            },
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        vi.spyOn(Jwt, "verifyToken")
            .mockImplementation(() => {
                throw error;
            });

        await AuthController.checkAuthentication(
            req,
            res,
            next
        );

        expect(next).toHaveBeenCalledWith(error);
    });


    it("Logout successfully", async () => {

        const req = {} as any;

        const res = {
            clearCookie: vi.fn(),
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        await AuthController.logout(req, res, next);

        expect(res.clearCookie).toHaveBeenCalledWith(
            "accessToken",
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            }
        );

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            message: "Logged out successfully",
        });
    });


    it("Logout handles error", async () => {

        const error = new Error("Cookie error");

        const req = {} as any;

        const res = {
            clearCookie: vi.fn(() => {
                throw error;
            }),
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as any;

        const next = vi.fn();

        await AuthController.logout(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

});