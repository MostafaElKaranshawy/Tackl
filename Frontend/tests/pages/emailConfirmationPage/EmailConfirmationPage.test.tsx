import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";

import EmailConfirmationPage from "../../../src/pages/emailConfirmationPage/EmailConfirmationPage";
import { confirmEmail } from "../../../src/services/authService";

vi.mock("../../../src/services/authService", () => ({
    confirmEmail: vi.fn(),
}));

describe("EmailConfirmationPage", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    const renderWithToken = (token: string) => {
        return render(
            <MemoryRouter initialEntries={[`/confirm-email/${token}`]}>
                <Routes>
                    <Route
                        path="/confirm-email/:token"
                        element={<EmailConfirmationPage />}
                    />
                </Routes>
            </MemoryRouter>
        );
    };

    const renderWithoutToken = () => {
        return render(
            <MemoryRouter initialEntries={["/confirm-email"]}>
                <Routes>
                    <Route
                        path="/confirm-email"
                        element={<EmailConfirmationPage />}
                    />
                </Routes>
            </MemoryRouter>
        );
    };

    describe("initial state", () => {
        it("should display the confirming message while loading", () => {
            vi.mocked(confirmEmail).mockReturnValue(
                new Promise(() => { })
            );

            renderWithToken("test-token");

            expect(
                screen.getByText("Email Confirmation")
            ).toBeInTheDocument();

            expect(
                screen.getByText("Confirming your email...")
            ).toBeInTheDocument();
        });
    });

    describe("successful confirmation", () => {
        it("should confirm the email successfully", async () => {
            vi.mocked(confirmEmail).mockResolvedValue({
                message: "Email confirmed successfully",
            });

            renderWithToken("test-token");

            await waitFor(() => {
                expect(
                    screen.getByText(
                        "Email confirmed successfully! You can now log in."
                    )
                ).toBeInTheDocument();
            });
        });

        it("should call confirmEmail with the token", async () => {
            vi.mocked(confirmEmail).mockResolvedValue({
                message: "Email confirmed successfully",
            });

            renderWithToken("my-test-token");

            await waitFor(() => {
                expect(confirmEmail).toHaveBeenCalledWith(
                    "my-test-token"
                );
            });
        });

        it("should display the Go to Login link after successful confirmation", async () => {
            vi.mocked(confirmEmail).mockResolvedValue({
                message: "Email confirmed successfully",
            });

            renderWithToken("test-token");

            const loginLink = await screen.findByRole(
                "link",
                {
                    name: "Go to Login",
                }
            );

            expect(loginLink).toBeInTheDocument();
            expect(loginLink).toHaveAttribute(
                "href",
                "/login"
            );
        });

        it("should stop displaying the loading state after successful confirmation", async () => {
            vi.mocked(confirmEmail).mockResolvedValue({
                message: "Email confirmed successfully",
            });

            renderWithToken("test-token");

            await waitFor(() => {
                expect(
                    screen.queryByText(
                        "Confirming your email..."
                    )
                ).not.toBeInTheDocument();
            });
        });
    });

    describe("failed confirmation", () => {
        it("should display an error message when confirmation fails", async () => {
            const error = new Error("Invalid token");

            vi.mocked(confirmEmail).mockRejectedValue(error);

            renderWithToken("invalid-token");

            await waitFor(() => {
                expect(
                    screen.getByText(
                        "Failed to confirm your email. The link may be invalid or expired."
                    )
                ).toBeInTheDocument();
            });
        });

        it("should display the Back to Sign Up link when confirmation fails", async () => {
            vi.mocked(confirmEmail).mockRejectedValue(
                new Error("Invalid token")
            );

            renderWithToken("invalid-token");

            const signupLink = await screen.findByRole(
                "link",
                {
                    name: "Back to Sign Up",
                }
            );

            expect(signupLink).toBeInTheDocument();
            expect(signupLink).toHaveAttribute(
                "href",
                "/"
            );
        });

        it("should stop displaying the loading state after confirmation fails", async () => {
            vi.mocked(confirmEmail).mockRejectedValue(
                new Error("Invalid token")
            );

            renderWithToken("invalid-token");

            await waitFor(() => {
                expect(
                    screen.queryByText(
                        "Confirming your email..."
                    )
                ).not.toBeInTheDocument();
            });
        });

        it("should call confirmEmail only once", async () => {
            vi.mocked(confirmEmail).mockRejectedValue(
                new Error("Invalid token")
            );

            renderWithToken("invalid-token");

            await waitFor(() => {
                expect(confirmEmail).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("missing token", () => {
        it("should not call confirmEmail when there is no token", async () => {
            renderWithoutToken();

            expect(confirmEmail).not.toHaveBeenCalled();
        });

        it("should keep the initial state when there is no token", () => {
            renderWithoutToken();

            expect(
                screen.getByText("Email Confirmation")
            ).toBeInTheDocument();

            expect(
                screen.getByText("Confirming your email...")
            ).toBeInTheDocument();
        });
    });
});