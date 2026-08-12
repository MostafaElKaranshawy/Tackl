import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
    signUp,
    login,
    getResetPasswordLink,
    resetPassword,
    confirmEmail,
    getEmailConfirmationLink,
    checkAuthentication,
    logout,
} from "../../src/services/authService";

describe("authService", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("signUp", () => {
        it("should successfully sign up a user", async () => {
            const responseData = {
                message: "Success",
            };

            const axiosPost = vi
                .spyOn(axios, "post")
                .mockResolvedValue({
                    data: responseData,
                });

            const name = "John Doe";
            const email = "test@example.com";
            const password = "password123";

            const result = await signUp(name, email, password);

            expect(result).toEqual(responseData);

            expect(axiosPost).toHaveBeenCalledWith(
                expect.stringContaining("/signup"),
                {
                    name,
                    email,
                    password,
                }
            );
        });

        it("should throw an error when name is missing", async () => {
            let error: unknown;

            try {
                await signUp("", "test@example.com", "password123");
            } catch (err) {
                error = err;
            }

            expect(error).toEqual(
                new Error("Name, email, and password are required")
            );
        });

        it("should throw an error when email is missing", async () => {
            let error: unknown;

            try {
                await signUp("John Doe", "", "password123");
            } catch (err) {
                error = err;
            }

            expect(error).toEqual(
                new Error("Name, email, and password are required")
            );
        });

        it("should throw an error when password is missing", async () => {
            let error: unknown;

            try {
                await signUp("John Doe", "test@example.com", "");
            } catch (err) {
                error = err;
            }

            expect(error).toEqual(
                new Error("Name, email, and password are required")
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error("Server error");

            vi.spyOn(axios, "post").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await signUp(
                    "John Doe",
                    "test@example.com",
                    "password123"
                );
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });

    describe("login", () => {
        it("should successfully login a user", async () => {
            const responseData = {
                message: "Login successful",
                user: {
                    id: "1",
                    name: "John Doe",
                },
            };

            const axiosPost = vi
                .spyOn(axios, "post")
                .mockResolvedValue({
                    data: responseData,
                });

            const email = "test@example.com";
            const password = "password123";

            const result = await login(email, password);

            expect(result).toEqual(responseData);

            expect(axiosPost).toHaveBeenCalledWith(
                expect.stringContaining("/login"),
                {
                    email,
                    password,
                },
                {
                    withCredentials: true,
                }
            );
        });

        it("should throw an error when email is missing", async () => {
            let error: unknown;

            try {
                await login("", "password123");
            } catch (err) {
                error = err;
            }

            expect(error).toEqual(
                new Error("Email and password are required")
            );
        });

        it("should throw an error when password is missing", async () => {
            let error: unknown;

            try {
                await login("test@example.com", "");
            } catch (err) {
                error = err;
            }

            expect(error).toEqual(
                new Error("Email and password are required")
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error("Invalid credentials");

            vi.spyOn(axios, "post").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await login(
                    "test@example.com",
                    "wrong-password"
                );
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });

    describe("getResetPasswordLink", () => {
        it("should successfully get the reset password link", async () => {
            const responseData = {
                message: "Reset password link sent",
            };

            const axiosGet = vi
                .spyOn(axios, "get")
                .mockResolvedValue({
                    data: responseData,
                });

            const email = "test@example.com";

            const result = await getResetPasswordLink(email);

            expect(result).toEqual(responseData);

            expect(axiosGet).toHaveBeenCalledWith(
                expect.stringContaining("/getResetPasswordLink"),
                {
                    params: {
                        email,
                    },
                }
            );
        });

        it("should throw an error when email is missing", async () => {
            let error: unknown;

            try {
                await getResetPasswordLink("");
            } catch (err) {
                error = err;
            }

            expect(error).toEqual(
                new Error("Email is required")
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error(
                "Failed to send reset link"
            );

            vi.spyOn(axios, "get").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await getResetPasswordLink(
                    "test@example.com"
                );
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });

    describe("resetPassword", () => {
        it("should successfully reset the password", async () => {
            const responseData = {
                message: "Password reset successfully",
            };

            const axiosPut = vi
                .spyOn(axios, "put")
                .mockResolvedValue({
                    data: responseData,
                });

            const password = "newPassword123";
            const token = "test-token";

            const result = await resetPassword(
                password,
                token
            );

            expect(result).toEqual(responseData);

            expect(axiosPut).toHaveBeenCalledWith(
                expect.stringContaining(
                    "/resetPasswordFromLink"
                ),
                {
                    password,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        });

        it("should throw an error when password is missing", async () => {
            let error: unknown;

            try {
                await resetPassword("", "test-token");
            } catch (err) {
                error = err;
            }

            expect(error).toEqual(
                new Error("Password and token are required")
            );
        });

        it("should throw an error when token is missing", async () => {
            let error: unknown;

            try {
                await resetPassword(
                    "newPassword123",
                    ""
                );
            } catch (err) {
                error = err;
            }

            expect(error).toEqual(
                new Error("Password and token are required")
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error("Invalid token");

            vi.spyOn(axios, "put").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await resetPassword(
                    "newPassword123",
                    "bad-token"
                );
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });

    describe("confirmEmail", () => {
        it("should successfully confirm the email", async () => {
            const responseData = {
                message: "Email confirmed successfully",
            };

            const axiosGet = vi
                .spyOn(axios, "get")
                .mockResolvedValue({
                    data: responseData,
                });

            const token = "test-token";

            const result = await confirmEmail(token);

            expect(result).toEqual(responseData);

            expect(axiosGet).toHaveBeenCalledWith(
                expect.stringContaining("/confirmEmail"),
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        });

        it("should throw an error when token is missing", async () => {
            let error: unknown;

            try {
                await confirmEmail("");
            } catch (err) {
                error = err;
            }

            expect(error).toEqual(
                new Error("Token is required")
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error(
                "Invalid confirmation token"
            );

            vi.spyOn(axios, "get").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await confirmEmail("bad-token");
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });

    describe("getEmailConfirmationLink", () => {
        it("should successfully get the confirmation link", async () => {
            const responseData = {
                message: "Confirmation link sent",
            };

            const axiosGet = vi
                .spyOn(axios, "get")
                .mockResolvedValue({
                    data: responseData,
                });

            const email = "test@example.com";

            const result =
                await getEmailConfirmationLink(email);

            expect(result).toEqual(responseData);

            expect(axiosGet).toHaveBeenCalledWith(
                expect.stringContaining(
                    "/getConfirmationLink"
                ),
                {
                    params: {
                        email,
                    },
                }
            );
        });

        it("should throw an error when email is missing", async () => {
            let error: unknown;

            try {
                await getEmailConfirmationLink("");
            } catch (err) {
                error = err;
            }

            expect(error).toEqual(
                new Error("Email is required")
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error(
                "Failed to send confirmation link"
            );

            vi.spyOn(axios, "get").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await getEmailConfirmationLink(
                    "test@example.com"
                );
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });

    describe("checkAuthentication", () => {
        it("should return true when authentication succeeds", async () => {
            const axiosGet = vi
                .spyOn(axios, "get")
                .mockResolvedValue({
                    data: {
                        authenticated: true,
                    },
                });

            const result = await checkAuthentication();

            expect(result).toBe(true);

            expect(axiosGet).toHaveBeenCalledWith(
                expect.stringContaining(
                    "/checkAuthentication"
                ),
                {
                    withCredentials: true,
                }
            );
        });

        it("should return false when authentication fails", async () => {
            vi.spyOn(axios, "get").mockRejectedValue(
                new Error("Unauthorized")
            );

            const result = await checkAuthentication();

            expect(result).toBe(false);
        });
    });

    describe("logout", () => {
        it("should successfully logout the user", async () => {
            const axiosPost = vi
                .spyOn(axios, "post")
                .mockResolvedValue({
                    data: {
                        message: "Logged out successfully",
                    },
                });

            await logout();

            expect(axiosPost).toHaveBeenCalledWith(
                expect.stringContaining("/logout"),
                {},
                {
                    withCredentials: true,
                }
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error("Logout failed");

            vi.spyOn(axios, "post").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await logout();
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });
});