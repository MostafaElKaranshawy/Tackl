import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import axios from "axios";
import SignUpPage from "../../../src/pages/signUpPage/SignUpPage";
import {
    signUp,
    checkAuthentication,
} from "../../../src/services/authService";

vi.mock("../../../src/services/authService", () => ({
    signUp: vi.fn(),
    checkAuthentication: vi.fn(),
}));

describe("SignUpPage", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    const renderSignUpPage = () => {
        return render(
            <MemoryRouter initialEntries={["/signup"]}>
                <Routes>
                    <Route
                        path="/signup"
                        element={<SignUpPage />}
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
        it("should display the sign-up form", () => {
            vi.mocked(checkAuthentication).mockResolvedValue(false);

            renderSignUpPage();

            expect(
                document.querySelector('input[type="text"]')
            ).toBeInTheDocument();

            expect(
                document.querySelector('input[type="email"]')
            ).toBeInTheDocument();

            expect(
                document.querySelector('input[type="password"]')
            ).toBeInTheDocument();

            expect(
                screen.getByRole("button", {
                    name: "Sign Up",
                })
            ).toBeInTheDocument();
        });
    });

    describe("authentication", () => {
        it("should redirect authenticated users to projects", async () => {
            vi.mocked(checkAuthentication).mockResolvedValue(true);

            renderSignUpPage();

            expect(
                await screen.findByText("Projects Page")
            ).toBeInTheDocument();
        });

        it("should stay on the sign-up page when user is not authenticated", async () => {
            vi.mocked(checkAuthentication).mockResolvedValue(false);

            renderSignUpPage();

            expect(
                document.querySelector('button[type="submit"]')
            ).toBeInTheDocument();
        });

        it("should call checkAuthentication on mount", () => {
            vi.mocked(checkAuthentication).mockResolvedValue(false);

            renderSignUpPage();

            expect(
                checkAuthentication
            ).toHaveBeenCalled();
        });
    });

    describe("form submission", () => {
        it("should call signUp with correct parameters on valid form submission", async () => {
            const user = userEvent.setup();

            vi.mocked(checkAuthentication).mockResolvedValue(false);
            vi.mocked(signUp).mockResolvedValue({
                message: "Sign up successful",
            });

            renderSignUpPage();

            const nameInput = document.querySelector(
                'input[type="text"]'
            ) as HTMLInputElement;

            const emailInput = document.querySelector(
                'input[type="email"]'
            ) as HTMLInputElement;

            const passwordInput = document.querySelector(
                'input[type="password"]'
            ) as HTMLInputElement;

            await user.type(nameInput, "John Doe");
            await user.type(emailInput, "test@example.com");
            await user.type(passwordInput, "Password123!");

            const submitButton = screen.getByRole("button", {
                name: "Sign Up",
            });

            await user.click(submitButton);

            expect(signUp).toHaveBeenCalledWith(
                "John Doe",
                "test@example.com",
                "Password123!"
            );
        });
        it("should call signUp with incorrect parameters and return an error - status code 400", async () => {
            const user = userEvent.setup();

            vi.mocked(checkAuthentication).mockResolvedValue(false);
            vi.mocked(signUp).mockResolvedValue(new axios.AxiosError("Sign up failed", "400"));
            renderSignUpPage();

            const nameInput = document.querySelector(
                'input[type="text"]'
            ) as HTMLInputElement;

            const emailInput = document.querySelector(
                'input[type="email"]'
            ) as HTMLInputElement;

            const passwordInput = document.querySelector(
                'input[type="password"]'
            ) as HTMLInputElement;

            await user.type(nameInput, "John Doe");
            await user.type(emailInput, "test@example.com");
            await user.type(passwordInput, "Password123!");

            const submitButton = screen.getByRole("button", {
                name: "Sign Up",
            });
            try {
                await user.click(submitButton);
                expect(signUp).toHaveBeenCalledWith(
                    "John Doe",
                    "test@example.com",
                    "Password123!"
                );
            } catch (error) {
                expect(error).toEqual(new axios.AxiosError("Sign up failed", "400"));
            }

        });

        it("should call signUp with incorrect parameters and return an error - status code 409", async () => {
            const user = userEvent.setup();

            vi.mocked(checkAuthentication).mockResolvedValue(false);
            vi.mocked(signUp).mockResolvedValue(new axios.AxiosError("Email already exists", "409"));
            renderSignUpPage();

            const nameInput = document.querySelector(
                'input[type="text"]'
            ) as HTMLInputElement;

            const emailInput = document.querySelector(
                'input[type="email"]'
            ) as HTMLInputElement;

            const passwordInput = document.querySelector(
                'input[type="password"]'
            ) as HTMLInputElement;

            await user.type(nameInput, "John Doe");
            await user.type(emailInput, "test@example.com");
            await user.type(passwordInput, "Password123!");

            const submitButton = screen.getByRole("button", {
                name: "Sign Up",
            });
            try {
                await user.click(submitButton);
                expect(signUp).toHaveBeenCalledWith(
                    "John Doe",
                    "test@example.com",
                    "Password123!"
                );
            } catch (error) {
                expect(error).toEqual(new axios.AxiosError("Email already exists", "409"));
            }

        });

        it("should call signUp with incorrect parameters and return an error", async () => {
            const user = userEvent.setup();

            vi.mocked(checkAuthentication).mockResolvedValue(false);
            vi.mocked(signUp).mockResolvedValue(new axios.AxiosError("Sign up failed"));
            renderSignUpPage();

            const nameInput = document.querySelector(
                'input[type="text"]'
            ) as HTMLInputElement;

            const emailInput = document.querySelector(
                'input[type="email"]'
            ) as HTMLInputElement;

            const passwordInput = document.querySelector(
                'input[type="password"]'
            ) as HTMLInputElement;

            await user.type(nameInput, "John Doe");
            await user.type(emailInput, "test@example.com");
            await user.type(passwordInput, "Password123!");

            const submitButton = screen.getByRole("button", {
                name: "Sign Up",
            });
            await user.click(submitButton);

            const showPasswordButton = document.querySelector(
                'span[role="button"]'
            ) as HTMLButtonElement;
            await user.click(showPasswordButton);
            await user.click(showPasswordButton);
            expect(signUp).toHaveBeenCalledWith(
                "John Doe",
                "test@example.com",
                "Password123!"
            );
        });
    });
});