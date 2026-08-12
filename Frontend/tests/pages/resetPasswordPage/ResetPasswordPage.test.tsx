import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import ResetPasswordPage from "../../../src/pages/resetPasswordPage/ResetPasswordPage";
import { resetPassword } from "../../../src/services/authService";

vi.mock("../../../src/services/authService", () => ({
    resetPassword: vi.fn(),
}));

describe("ResetPasswordPage", () => {
    afterEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    const renderResetPasswordPage = (token?: string) => {
        return render(
            <MemoryRouter
                initialEntries={[
                    token
                        ? `/reset-password/${token}`
                        : "/reset-password",
                ]}
            >
                <Routes>
                    <Route
                        path="/reset-password/:token"
                        element={<ResetPasswordPage />}
                    />
                    <Route
                        path="/reset-password"
                        element={<ResetPasswordPage />}
                    />
                    <Route
                        path="/login"
                        element={<div>Login Page</div>}
                    />
                </Routes>
            </MemoryRouter>
        );
    };

    describe("initial state", () => {
        it("should display the reset password form", () => {
            renderResetPasswordPage("test-token");

            expect(
                screen.getByRole("heading", { name: "Reset Password" })
            ).toBeInTheDocument();

            expect(
                screen.getByText("Enter your new password below")
            ).toBeInTheDocument();

            const passwordInputs = document.querySelectorAll(
                'input[type="password"]'
            );

            expect(passwordInputs).toHaveLength(2);

            expect(
                screen.getByRole("button", {
                    name: "Reset Password",
                })
            ).toBeInTheDocument();

            expect(
                screen.getByText("At least 8 characters")
            ).toBeInTheDocument();

            expect(
                screen.getByText("At least one uppercase letter")
            ).toBeInTheDocument();

            expect(
                screen.getByText("At least one lowercase letter")
            ).toBeInTheDocument();

            expect(
                screen.getByText("At least one number")
            ).toBeInTheDocument();

            expect(
                screen.getByText("At least one special character")
            ).toBeInTheDocument();
        });
    });

    describe("form submission", () => {
        it("should call resetPassword with the correct password and token", async () => {
            const user = userEvent.setup();

            vi.mocked(resetPassword).mockResolvedValue({
                message: "Password reset successful",
            });

            renderResetPasswordPage("test-token");

            const passwordInputs = document.querySelectorAll(
                'input[type="password"]'
            );

            const passwordInput = passwordInputs[0] as HTMLInputElement;
            const confirmPasswordInput =
                passwordInputs[1] as HTMLInputElement;

            await user.type(passwordInput, "Password123!");
            await user.type(confirmPasswordInput, "Password123!");

            await user.click(
                screen.getByRole("button", {
                    name: "Reset Password",
                })
            );

            expect(resetPassword).toHaveBeenCalledWith(
                "Password123!",
                "test-token"
            );
        });

        it("should not call resetPassword when passwords do not match", async () => {
            const user = userEvent.setup();

            renderResetPasswordPage("test-token");

            const passwordInputs = document.querySelectorAll(
                'input[type="password"]'
            );

            await user.type(
                passwordInputs[0] as HTMLInputElement,
                "Password123!"
            );

            await user.type(
                passwordInputs[1] as HTMLInputElement,
                "Password456!"
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Reset Password",
                })
            );

            expect(resetPassword).not.toHaveBeenCalled();
        });

        it("should not call resetPassword when the password is invalid", async () => {
            const user = userEvent.setup();

            renderResetPasswordPage("test-token");

            const passwordInputs = document.querySelectorAll(
                'input[type="password"]'
            );

            await user.type(
                passwordInputs[0] as HTMLInputElement,
                "password"
            );

            await user.type(
                passwordInputs[1] as HTMLInputElement,
                "password"
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Reset Password",
                })
            );

            expect(resetPassword).not.toHaveBeenCalled();

            expect(
                screen.getByText(
                    "Password does not meet the required criteria."
                )
            ).toBeInTheDocument();
        });

        it("should not call resetPassword when the token is missing", async () => {
            const user = userEvent.setup();

            renderResetPasswordPage();

            const passwordInputs = document.querySelectorAll(
                'input[type="password"]'
            );

            await user.type(
                passwordInputs[0] as HTMLInputElement,
                "Password123!"
            );

            await user.type(
                passwordInputs[1] as HTMLInputElement,
                "Password123!"
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Reset Password",
                })
            );

            expect(resetPassword).not.toHaveBeenCalled();
        });

        it("should handle resetPassword failure", async () => {
            const user = userEvent.setup();

            vi.mocked(resetPassword).mockRejectedValue(
                new Error("Reset password failed")
            );

            renderResetPasswordPage("test-token");

            const passwordInputs = document.querySelectorAll(
                'input[type="password"]'
            );

            await user.type(
                passwordInputs[0] as HTMLInputElement,
                "Password123!"
            );

            await user.type(
                passwordInputs[1] as HTMLInputElement,
                "Password123!"
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Reset Password",
                })
            );

            expect(resetPassword).toHaveBeenCalledWith(
                "Password123!",
                "test-token"
            );
        });
    });

    describe("password visibility", () => {
        it("should show and hide the new password", async () => {
            const user = userEvent.setup();

            renderResetPasswordPage("test-token");

            const passwordInputs = document.querySelectorAll(
                'input[type="password"]'
            );

            const passwordInput = passwordInputs[0] as HTMLInputElement;

            const passwordContainer =
                passwordInput.parentElement?.parentElement;

            const toggle = passwordContainer?.querySelector(
                "span"
            ) as HTMLElement;

            expect(passwordInput).toHaveAttribute(
                "type",
                "password"
            );

            await user.click(toggle);

            expect(passwordInput).toHaveAttribute(
                "type",
                "text"
            );

            await user.click(toggle);

            expect(passwordInput).toHaveAttribute(
                "type",
                "password"
            );
        });

        it("should show and hide the confirm password", async () => {
            const user = userEvent.setup();

            renderResetPasswordPage("test-token");

            const passwordInputs = document.querySelectorAll(
                'input[type="password"]'
            );

            const confirmPasswordInput =
                passwordInputs[1] as HTMLInputElement;

            const passwordContainer =
                confirmPasswordInput.parentElement?.parentElement;

            const toggle = passwordContainer?.querySelector(
                "span"
            ) as HTMLElement;

            expect(confirmPasswordInput).toHaveAttribute(
                "type",
                "password"
            );

            await user.click(toggle);

            expect(confirmPasswordInput).toHaveAttribute(
                "type",
                "text"
            );

            await user.click(toggle);

            expect(confirmPasswordInput).toHaveAttribute(
                "type",
                "password"
            );
        });
    });
});