import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import axios from "axios";

import LoginPage from "../../../src/pages/loginPage/LoginPage";
import {
    login,
    checkAuthentication,
} from "../../../src/services/authService";

vi.mock("../../../src/services/authService", () => ({
    login: vi.fn(),
    checkAuthentication: vi.fn(),
}));

describe("LoginPage", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    const renderLoginPage = () => {
        return render(
            <MemoryRouter initialEntries={["/login"]}>
                <Routes>
                    <Route
                        path="/login"
                        element={<LoginPage />}
                    />
                    <Route
                        path="/projects"
                        element={<div>Projects Page</div>}
                    />
                </Routes>
            </MemoryRouter>
        );
    };

    describe("initial state", () => {
        it("should display the login form", () => {
            vi.mocked(checkAuthentication).mockResolvedValue(false);

            renderLoginPage();

            expect(
                screen.getByRole("heading", {
                    name: "Login",
                })
            ).toBeInTheDocument();

            expect(
                screen.getByText("Sign in to your account")
            ).toBeInTheDocument();

            expect(
                document.querySelector('input[type="email"]')
            ).toBeInTheDocument();

            expect(
                document.querySelector('input[type="password"]')
            ).toBeInTheDocument();

            expect(
                screen.getByRole("button", {
                    name: "Login",
                })
            ).toBeInTheDocument();
        });
    });

    describe("authentication", () => {
        it("should redirect authenticated users to projects", async () => {
            vi.mocked(checkAuthentication).mockResolvedValue(true);

            renderLoginPage();

            expect(
                await screen.findByText("Projects Page")
            ).toBeInTheDocument();
        });

        it("should stay on the login page when user is not authenticated", () => {
            vi.mocked(checkAuthentication).mockResolvedValue(false);

            renderLoginPage();

            expect(
                screen.getByRole("heading", {
                    name: "Login",
                })
            ).toBeInTheDocument();
        });

        it("should call checkAuthentication on mount", () => {
            vi.mocked(checkAuthentication).mockResolvedValue(false);

            renderLoginPage();

            expect(checkAuthentication).toHaveBeenCalled();
        });
    });

    describe("form submission", () => {
        it("should call login with correct parameters", async () => {
            const user = userEvent.setup();

            vi.mocked(checkAuthentication).mockResolvedValue(false);
            vi.mocked(login).mockResolvedValue({
                message: "Login successful",
            });

            renderLoginPage();

            const emailInput = document.querySelector(
                'input[type="email"]'
            ) as HTMLInputElement;

            const passwordInput = document.querySelector(
                'input[type="password"]'
            ) as HTMLInputElement;

            await user.type(
                emailInput,
                "test@example.com"
            );

            await user.type(
                passwordInput,
                "Password123!"
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Login",
                })
            );

            expect(login).toHaveBeenCalledWith(
                "test@example.com",
                "Password123!"
            );
        });

        it("should navigate to projects after successful login", async () => {
            const user = userEvent.setup();

            vi.mocked(checkAuthentication).mockResolvedValue(false);
            vi.mocked(login).mockResolvedValue({
                message: "Login successful",
            });

            renderLoginPage();

            const emailInput = document.querySelector(
                'input[type="email"]'
            ) as HTMLInputElement;

            const passwordInput = document.querySelector(
                'input[type="password"]'
            ) as HTMLInputElement;

            await user.type(
                emailInput,
                "test@example.com"
            );

            await user.type(
                passwordInput,
                "Password123!"
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Login",
                })
            );

            expect(
                await screen.findByText("Projects Page")
            ).toBeInTheDocument();
        });

        it("should handle login error with status code 400", async () => {
            const user = userEvent.setup();

            vi.mocked(checkAuthentication).mockResolvedValue(false);

            const error = new axios.AxiosError(
                "Invalid input"
            );

            error.response = {
                status: 400,
                data: {},
                statusText: "Bad Request",
                headers: {},
                config: {} as any,
            };

            vi.mocked(login).mockRejectedValue(error);

            renderLoginPage();

            const emailInput = document.querySelector(
                'input[type="email"]'
            ) as HTMLInputElement;

            const passwordInput = document.querySelector(
                'input[type="password"]'
            ) as HTMLInputElement;

            await user.type(
                emailInput,
                "test@example.com"
            );

            await user.type(
                passwordInput,
                "Password123!"
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Login",
                })
            );

            expect(login).toHaveBeenCalledWith(
                "test@example.com",
                "Password123!"
            );
        });

        it("should handle login error with status code 401", async () => {
            const user = userEvent.setup();

            vi.mocked(checkAuthentication).mockResolvedValue(false);

            const error = new axios.AxiosError(
                "Invalid credentials"
            );

            error.response = {
                status: 401,
                data: {},
                statusText: "Unauthorized",
                headers: {},
                config: {} as any,
            };

            vi.mocked(login).mockRejectedValue(error);

            renderLoginPage();

            const emailInput = document.querySelector(
                'input[type="email"]'
            ) as HTMLInputElement;

            const passwordInput = document.querySelector(
                'input[type="password"]'
            ) as HTMLInputElement;

            await user.type(
                emailInput,
                "test@example.com"
            );

            await user.type(
                passwordInput,
                "Password123!"
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Login",
                })
            );

            expect(login).toHaveBeenCalledWith(
                "test@example.com",
                "Password123!"
            );
        });

        it("should handle unexpected Axios error", async () => {
            const user = userEvent.setup();

            vi.mocked(checkAuthentication).mockResolvedValue(false);

            const error = new axios.AxiosError(
                "Server error"
            );

            error.response = {
                status: 500,
                data: {},
                statusText: "Internal Server Error",
                headers: {},
                config: {} as any,
            };

            vi.mocked(login).mockRejectedValue(error);

            renderLoginPage();

            const emailInput = document.querySelector(
                'input[type="email"]'
            ) as HTMLInputElement;

            const passwordInput = document.querySelector(
                'input[type="password"]'
            ) as HTMLInputElement;

            await user.type(
                emailInput,
                "test@example.com"
            );

            await user.type(
                passwordInput,
                "Password123!"
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Login",
                })
            );

            expect(login).toHaveBeenCalledWith(
                "test@example.com",
                "Password123!"
            );
        });

        it("should handle unexpected non-Axios error", async () => {
            const user = userEvent.setup();

            vi.mocked(checkAuthentication).mockResolvedValue(false);

            vi.mocked(login).mockRejectedValue(
                new Error("Unexpected error")
            );

            renderLoginPage();

            const emailInput = document.querySelector(
                'input[type="email"]'
            ) as HTMLInputElement;

            const passwordInput = document.querySelector(
                'input[type="password"]'
            ) as HTMLInputElement;

            await user.type(
                emailInput,
                "test@example.com"
            );

            await user.type(
                passwordInput,
                "Password123!"
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Login",
                })
            );

            expect(login).toHaveBeenCalledWith(
                "test@example.com",
                "Password123!"
            );
        });
    });

    describe("password visibility", () => {
        it("should toggle password visibility", async () => {
            const user = userEvent.setup();

            vi.mocked(checkAuthentication).mockResolvedValue(false);

            renderLoginPage();

            const passwordInput = document.querySelector(
                'input[type="password"]'
            ) as HTMLInputElement;

            const toggle = passwordInput.parentElement
                ?.parentElement
                ?.querySelector("span") as HTMLElement;

            expect(
                passwordInput
            ).toHaveAttribute("type", "password");

            await user.click(toggle);

            expect(
                passwordInput
            ).toHaveAttribute("type", "text");

            await user.click(toggle);

            expect(
                passwordInput
            ).toHaveAttribute("type", "password");
        });
    });
});