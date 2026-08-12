import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import GetPasswordLinkPage from "../../../src/pages/resetPasswordPage/GetPasswordLinkPage";
import { getResetPasswordLink } from "../../../src/services/authService";

vi.mock("../../../src/services/authService", () => ({
    getResetPasswordLink: vi.fn(),
}));

describe("GetPasswordLinkPage", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    const renderGetPasswordLinkPage = () => {
        return render(
            <MemoryRouter initialEntries={["/reset-password"]} >
                <Routes>
                    <Route
                        path="/reset-password"
                        element={< GetPasswordLinkPage />}
                    />
                    < Route
                        path="/login"
                        element={< div > Login Page </div>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );
    };

    describe("initial state", () => {
        it("should display the reset password form", () => {
            renderGetPasswordLinkPage();

            expect(
                screen.getByText("Reset Password")
            ).toBeInTheDocument();

            expect(
                screen.getByText(
                    "Enter your email to receive a password reset link."
                )
            ).toBeInTheDocument();

            expect(
                document.querySelector('input[type="email"]')
            ).toBeInTheDocument();

            expect(
                screen.getByRole("button", {
                    name: "Get Reset Link",
                })
            ).toBeInTheDocument();
        });
    });

    describe("form submission", () => {
        it("should call getResetPasswordLink with the correct email", async () => {
            const user = userEvent.setup();

            vi.mocked(getResetPasswordLink).mockResolvedValue({
                message: "Password reset link sent",
            });

            renderGetPasswordLinkPage();

            const emailInput = document.querySelector(
                'input[type="email"]'
            ) as HTMLInputElement;

            await user.type(emailInput, "test@example.com");

            const submitButton = screen.getByRole("button", {
                name: "Get Reset Link",
            });

            await user.click(submitButton);

            expect(getResetPasswordLink).toHaveBeenCalledWith(
                "test@example.com"
            );
        });

        it("should navigate to login after successful submission", async () => {
            const user = userEvent.setup();

            vi.mocked(getResetPasswordLink).mockResolvedValue({
                message: "Password reset link sent",
            });

            renderGetPasswordLinkPage();

            const emailInput = document.querySelector(
                'input[type="email"]'
            ) as HTMLInputElement;

            await user.type(emailInput, "test@example.com");

            const submitButton = screen.getByRole("button", {
                name: "Get Reset Link",
            });

            await user.click(submitButton);

            expect(
                await screen.findByText("Login Page")
            ).toBeInTheDocument();
        });

        it("should handle an error when sending the reset password link", async () => {
            const user = userEvent.setup();

            vi.mocked(getResetPasswordLink).mockRejectedValue(
                new Error("Failed to send reset password link")
            );

            renderGetPasswordLinkPage();

            const emailInput = document.querySelector(
                'input[type="email"]'
            ) as HTMLInputElement;

            await user.type(emailInput, "test@example.com");

            const submitButton = screen.getByRole("button", {
                name: "Get Reset Link",
            });

            await user.click(submitButton);

            expect(getResetPasswordLink).toHaveBeenCalledWith(
                "test@example.com"
            );

            expect(
                screen.getByText("Get Reset Link")
            ).toBeInTheDocument();
        });
    });
});