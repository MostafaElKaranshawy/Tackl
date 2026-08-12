import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import axios from "axios";

import GetEmailConfirmationLinkPage from "../../../src/pages/emailConfirmationPage/GetEmailConfirmationLinkPage";
import { getEmailConfirmationLink } from "../../../src/services/authService";

vi.mock("../../../src/services/authService", () => ({
    getEmailConfirmationLink: vi.fn(),
}));

describe("GetEmailConfirmationLinkPage", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    const renderPage = () => {
        return render(
            <MemoryRouter initialEntries={["/confirm-email"]}>
                <Routes>
                    <Route
                        path="/confirm-email"
                        element={<GetEmailConfirmationLinkPage />}
                    />
                    <Route
                        path="/login"
                        element={<div>Login Page</div>}
                    />
                </Routes>
            </MemoryRouter>
        );
    };

    const getEmailInput = () => {
        return document.querySelector(
            'input[type="email"]'
        ) as HTMLInputElement;
    };

    describe("initial state", () => {
        it("should display the email form", () => {
            renderPage();

            expect(
                screen.getByText("Get Email Confirmation Link")
            ).toBeInTheDocument();

            expect(
                screen.getByText(
                    "Enter your email to receive a confirmation link"
                )
            ).toBeInTheDocument();

            expect(
                getEmailInput()
            ).toBeInTheDocument();

            expect(
                screen.getByRole("button", {
                    name: "Send Confirmation Link",
                })
            ).toBeInTheDocument();
        });
    });

    describe("form submission", () => {
        it("should call getEmailConfirmationLink with the entered email", async () => {
            const user = userEvent.setup();

            vi.mocked(getEmailConfirmationLink).mockResolvedValue({
                message: "Success",
            });

            renderPage();

            const emailInput = getEmailInput();

            await user.type(emailInput, "test@example.com");

            await user.click(
                screen.getByRole("button", {
                    name: "Send Confirmation Link",
                })
            );

            expect(
                getEmailConfirmationLink
            ).toHaveBeenCalledWith("test@example.com");
        });

    });

    describe("error handling", () => {
        it("should handle 400 Axios error", async () => {
            const user = userEvent.setup();

            vi.mocked(getEmailConfirmationLink).mockRejectedValue(
                new axios.AxiosError(
                    "Invalid input",
                    "ERR_BAD_REQUEST",
                    undefined,
                    undefined,
                    {
                        status: 400,
                        statusText: "Bad Request",
                        headers: {},
                        config: {} as any,
                        data: {},
                    }
                )
            );

            renderPage();

            const emailInput = getEmailInput();

            await user.type(emailInput, "test@example.com");

            await user.click(
                screen.getByRole("button", {
                    name: "Send Confirmation Link",
                })
            );

            expect(
                getEmailConfirmationLink
            ).toHaveBeenCalledWith("test@example.com");
        });

        it("should handle 409 Axios error when email is already confirmed", async () => {
            const user = userEvent.setup();

            vi.mocked(getEmailConfirmationLink).mockRejectedValue(
                new axios.AxiosError(
                    "Email already confirmed",
                    "ERR_BAD_REQUEST",
                    undefined,
                    undefined,
                    {
                        status: 409,
                        statusText: "Conflict",
                        headers: {},
                        config: {} as any,
                        data: {
                            message:
                                "Email is already confirmed, login instead",
                        },
                    }
                )
            );

            renderPage();

            const emailInput = getEmailInput();

            await user.type(emailInput, "test@example.com");

            await user.click(
                screen.getByRole("button", {
                    name: "Send Confirmation Link",
                })
            );

            expect(
                getEmailConfirmationLink
            ).toHaveBeenCalledWith("test@example.com");
        });

        it("should handle 409 Axios error when confirmation link was recently sent", async () => {
            const user = userEvent.setup();

            vi.mocked(getEmailConfirmationLink).mockRejectedValue(
                new axios.AxiosError(
                    "Recently sent",
                    "ERR_BAD_REQUEST",
                    undefined,
                    undefined,
                    {
                        status: 409,
                        statusText: "Conflict",
                        headers: {},
                        config: {} as any,
                        data: {
                            message: "Confirmation link was sent recently",
                        },
                    }
                )
            );

            renderPage();

            const emailInput = getEmailInput();

            await user.type(emailInput, "test@example.com");

            await user.click(
                screen.getByRole("button", {
                    name: "Send Confirmation Link",
                })
            );

            expect(
                getEmailConfirmationLink
            ).toHaveBeenCalledWith("test@example.com");
        });

        it("should handle 404 Axios error", async () => {
            const user = userEvent.setup();

            vi.mocked(getEmailConfirmationLink).mockRejectedValue(
                new axios.AxiosError(
                    "Email not found",
                    "ERR_BAD_REQUEST",
                    undefined,
                    undefined,
                    {
                        status: 404,
                        statusText: "Not Found",
                        headers: {},
                        config: {} as any,
                        data: {},
                    }
                )
            );

            renderPage();

            const emailInput = getEmailInput();

            await user.type(emailInput, "test@example.com");

            await user.click(
                screen.getByRole("button", {
                    name: "Send Confirmation Link",
                })
            );

            expect(
                getEmailConfirmationLink
            ).toHaveBeenCalledWith("test@example.com");
        });

        it("should handle unexpected Axios error", async () => {
            const user = userEvent.setup();

            vi.mocked(getEmailConfirmationLink).mockRejectedValue(
                new axios.AxiosError(
                    "Server error",
                    "ERR_BAD_REQUEST",
                    undefined,
                    undefined,
                    {
                        status: 500,
                        statusText: "Internal Server Error",
                        headers: {},
                        config: {} as any,
                        data: {},
                    }
                )
            );

            renderPage();

            const emailInput = getEmailInput();

            await user.type(emailInput, "test@example.com");

            await user.click(
                screen.getByRole("button", {
                    name: "Send Confirmation Link",
                })
            );

            expect(
                getEmailConfirmationLink
            ).toHaveBeenCalledWith("test@example.com");
        });

        it("should handle non-Axios errors", async () => {
            const user = userEvent.setup();

            vi.mocked(getEmailConfirmationLink).mockRejectedValue(
                new Error("Network error")
            );

            renderPage();

            const emailInput = getEmailInput();

            await user.type(emailInput, "test@example.com");

            await user.click(
                screen.getByRole("button", {
                    name: "Send Confirmation Link",
                })
            );

            expect(
                getEmailConfirmationLink
            ).toHaveBeenCalledWith("test@example.com");
        });
    });
});