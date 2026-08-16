import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";
import AuthService from "../../src/services/authService";
import authRouter from "../../src/routes/authRouter";

const mocks = vi.hoisted(() => ({
    signUp: vi.fn(),
    login: vi.fn(),
    confirmEmail: vi.fn(),
    getConfirmationLink: vi.fn(),
    resetPassword: vi.fn(),
    getResetPasswordLink: vi.fn(),
    checkToken: vi.fn(),
    checkUser: vi.fn(),
}));

vi.mock("../../src/services/authService", () => ({
    default: {
        signUp: mocks.signUp,
        login: mocks.login,
        confirmEmail: mocks.confirmEmail,
        getConfirmationLink: mocks.getConfirmationLink,
        resetPassword: mocks.resetPassword,
        getResetPasswordLink: mocks.getResetPasswordLink,
    },
}));

vi.mock("../../src/middlewares/checkToken", () => ({
    default: mocks.checkToken.mockImplementation((req, res, next) => {
        req.userId = "user-id";
        req.tokenPurpose = "emailConfirmation";
        next();
    }),
}));

vi.mock("../../src/middlewares/checkUser", () => ({
    default: mocks.checkUser.mockImplementation((req, res, next) => {
        req.userId = "user-id";
        req.tokenPurpose = "passwordReset";
        next();
    }),
}));

const app = express();

app.use(express.json());
app.use("/api/auth", authRouter);

describe("Auth Router", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.checkToken.mockImplementation((req, res, next) => {
            req.userId = "user-id";
            req.tokenPurpose = "emailConfirmation";
            next();
        });

        mocks.checkUser.mockImplementation((req, res, next) => {
            req.userId = "user-id";
            req.tokenPurpose = "passwordReset";
            next();
        });
    });

    describe("POST /api/auth/signup", () => {
        it("should create a user successfully", async () => {
            mocks.signUp.mockResolvedValue(undefined);

            const response = await request(app)
                .post("/api/auth/signup")
                .send({
                    name: "Mostafa",
                    email: "mostafa@example.com",
                    password: "StrongPassword123!",
                });

            expect(response.status).toBe(201);

            expect(response.body).toEqual({
                message: "User created successfully",
            });

            expect(AuthService.signUp).toHaveBeenCalledTimes(1);
            expect(AuthService.signUp).toHaveBeenCalledWith(
                "Mostafa",
                "mostafa@example.com",
                "StrongPassword123!",
            );
        });

        it("should return 400 when required data is missing", async () => {
            const response = await request(app)
                .post("/api/auth/signup")
                .send({
                    email: "mostafa@example.com",
                    password: "StrongPassword123!",
                });

            expect(response.status).toBe(400);

            expect(response.body).toEqual({
                message: "Name is required",
            });

            expect(AuthService.signUp).not.toHaveBeenCalled();
        });
    });

    describe("POST /api/auth/login", () => {
        it("should login successfully", async () => {
            mocks.login.mockResolvedValue("test-access-token");

            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "mostafa@example.com",
                    password: "StrongPassword123!",
                });

            expect(response.status).toBe(200);

            expect(response.body).toEqual({
                message: "Login successful",
            });

            expect(response.headers["set-cookie"]).toBeDefined();

            expect(AuthService.login).toHaveBeenCalledTimes(1);
            expect(AuthService.login).toHaveBeenCalledWith(
                "mostafa@example.com",
                "StrongPassword123!",
            );
        });

        it("should return 400 when email is missing", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    password: "StrongPassword123!",
                });

            expect(response.status).toBe(400);

            expect(AuthService.login).not.toHaveBeenCalled();
        });

        it("should return 400 when password is missing", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "mostafa@example.com",
                });

            expect(response.status).toBe(400);

            expect(AuthService.login).not.toHaveBeenCalled();
        });
    });

    describe("GET /api/auth/confirmEmail", () => {
        it("should confirm the user's email successfully", async () => {
            mocks.checkToken.mockImplementation((req, res, next) => {
                req.userId = "user-id";
                req.tokenPurpose = "emailConfirmation";
                next();
            });

            mocks.confirmEmail.mockResolvedValue(undefined);

            const response = await request(app)
                .get("/api/auth/confirmEmail");

            expect(response.status).toBe(200);

            expect(response.body).toEqual({
                message: "Email confirmed successfully",
            });

            expect(AuthService.confirmEmail).toHaveBeenCalledTimes(1);
            expect(AuthService.confirmEmail).toHaveBeenCalledWith(
                "user-id",
            );
        });

        it("should reject an invalid token purpose", async () => {
            mocks.checkToken.mockImplementation((req, res, next) => {
                req.userId = "user-id";
                req.tokenPurpose = "passwordReset";
                next();
            });

            const response = await request(app)
                .get("/api/auth/confirmEmail");

            expect(response.status).toBe(403);

            expect(AuthService.confirmEmail).not.toHaveBeenCalled();
        });
    });

    describe("GET /api/auth/getConfirmationLink", () => {
        it("should send a confirmation link successfully", async () => {
            mocks.getConfirmationLink.mockResolvedValue(undefined);

            const response = await request(app)
                .get("/api/auth/getConfirmationLink")
                .query({
                    email: "mostafa@example.com",
                });

            expect(response.status).toBe(200);

            expect(response.body).toEqual({
                message:
                    "If an account with that email exists, a confirmation link has been sent.",
            });

            expect(AuthService.getConfirmationLink).toHaveBeenCalledTimes(1);
            expect(AuthService.getConfirmationLink).toHaveBeenCalledWith(
                "mostafa@example.com",
            );
        });

        it("should return 400 when email is missing", async () => {
            const response = await request(app)
                .get("/api/auth/getConfirmationLink");

            expect(response.status).toBe(400);

            expect(response.body).toEqual({
                message: "Email is required",
            });

            expect(AuthService.getConfirmationLink).not.toHaveBeenCalled();
        });
    });

    describe("PUT /api/auth/resetPasswordFromLink", () => {
        it("should reset the password successfully", async () => {
            mocks.checkToken.mockImplementation((req, res, next) => {
                req.userId = "user-id";
                req.tokenPurpose = "passwordReset";
                next();
            });

            mocks.resetPassword.mockResolvedValue(undefined);

            const response = await request(app)
                .put("/api/auth/resetPasswordFromLink")
                .send({
                    password: "NewStrongPassword123!",
                });

            expect(response.status).toBe(200);

            expect(response.body).toEqual({
                message: "Password reset successfully",
            });

            expect(AuthService.resetPassword).toHaveBeenCalledTimes(1);
            expect(AuthService.resetPassword).toHaveBeenCalledWith(
                "NewStrongPassword123!",
                "user-id",
            );
        });

        it("should reject an invalid token purpose", async () => {
            mocks.checkToken.mockImplementation((req, res, next) => {
                req.userId = "user-id";
                req.tokenPurpose = "emailConfirmation";
                next();
            });

            const response = await request(app)
                .put("/api/auth/resetPasswordFromLink")
                .send({
                    password: "NewStrongPassword123!",
                });

            expect(response.status).toBe(403);

            expect(AuthService.resetPassword).not.toHaveBeenCalled();
        });
    });

    describe("PUT /api/auth/resetPassword", () => {
        it("should reset the password successfully", async () => {
            mocks.checkUser.mockImplementation((req, res, next) => {
                req.userId = "user-id";
                req.tokenPurpose = "passwordReset";
                next();
            });

            mocks.resetPassword.mockResolvedValue(undefined);

            const response = await request(app)
                .put("/api/auth/resetPassword")
                .send({
                    password: "NewStrongPassword123!",
                });

            expect(response.status).toBe(200);

            expect(response.body).toEqual({
                message: "Password reset successfully",
            });

            expect(AuthService.resetPassword).toHaveBeenCalledTimes(1);
            expect(AuthService.resetPassword).toHaveBeenCalledWith(
                "NewStrongPassword123!",
                "user-id",
            );
        });

        it("should reject an invalid token purpose", async () => {
            mocks.checkUser.mockImplementation((req, res, next) => {
                req.userId = "user-id";
                req.tokenPurpose = "emailConfirmation";
                next();
            });

            const response = await request(app)
                .put("/api/auth/resetPassword")
                .send({
                    password: "NewStrongPassword123!",
                });

            expect(response.status).toBe(403);

            expect(AuthService.resetPassword).not.toHaveBeenCalled();
        });
    });

    describe("GET /api/auth/getResetPasswordLink", () => {
        it("should send a reset password link successfully", async () => {
            mocks.getResetPasswordLink.mockResolvedValue(undefined);

            const response = await request(app)
                .get("/api/auth/getResetPasswordLink")
                .query({
                    email: "mostafa@example.com",
                });

            expect(response.status).toBe(200);

            expect(response.body).toEqual({
                message:
                    "If an account with that email exists, a password reset link has been sent.",
            });

            expect(AuthService.getResetPasswordLink).toHaveBeenCalledTimes(1);
            expect(AuthService.getResetPasswordLink).toHaveBeenCalledWith(
                "mostafa@example.com",
            );
        });

        it("should return 400 when email is missing", async () => {
            const response = await request(app)
                .get("/api/auth/getResetPasswordLink");

            expect(response.status).toBe(400);

            expect(response.body).toEqual({
                message: "Email is required",
            });

            expect(AuthService.getResetPasswordLink).not.toHaveBeenCalled();
        });
    });

    describe("GET /api/auth/checkAuthentication", () => {
        it("should return 401 when no access token exists", async () => {
            const response = await request(app)
                .get("/api/auth/checkAuthentication");
            expect(response.status).toBe(401);

            expect(response.body).toEqual({
                message: "Not authenticated",
            });
        });
    });

    describe("POST /api/auth/logout", () => {
        it("should logout successfully", async () => {
            const response = await request(app)
                .post("/api/auth/logout");

            expect(response.status).toBe(200);

            expect(response.body).toEqual({
                message: "Logged out successfully",
            });

            expect(response.headers["set-cookie"]).toBeDefined();
        });
    });

    describe("Unknown routes", () => {
        it("should return 404 for an unknown auth route", async () => {
            const response = await request(app)
                .get("/api/auth/does-not-exist");

            expect(response.status).toBe(404);
        });
    });
});