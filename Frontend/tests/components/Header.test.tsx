import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Header from "../../src/components/Header";
import { logout } from "../../src/services/authService";

const navigate = vi.fn();

vi.mock("../../src/services/authService", () => ({
    logout: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>(
        "react-router-dom"
    );

    return {
        ...actual,
        useNavigate: () => navigate,
    };
});

describe("Header", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    const renderHeader = () => {
        return render(<Header />);
    };

    describe("initial state", () => {
        it("should render the header", () => {
            renderHeader();

            expect(screen.getByText("Tackl")).toBeInTheDocument();
            expect(
                screen.getByPlaceholderText("Search...")
            ).toBeInTheDocument();
        });

        it("should not display the logout option initially", () => {
            renderHeader();

            expect(
                screen.queryByRole("button", {
                    name: "Logout",
                })
            ).not.toBeInTheDocument();
        });
    });

    describe("logout menu", () => {
        it("should display the logout option when clicking the user profile", async () => {
            const user = userEvent.setup();

            renderHeader();

            const userProfile = document.querySelector(
                ".user-profile"
            ) as HTMLElement;

            await user.click(userProfile);

            expect(
                screen.getByRole("button", {
                    name: "Logout",
                })
            ).toBeInTheDocument();
        });

        it("should hide the logout option when clicking outside", async () => {
            const user = userEvent.setup();

            renderHeader();

            const userProfile = document.querySelector(
                ".user-profile"
            ) as HTMLElement;

            await user.click(userProfile);

            expect(
                screen.getByRole("button", {
                    name: "Logout",
                })
            ).toBeInTheDocument();

            await user.click(screen.getByText("Tackl"));

            expect(
                screen.queryByRole("button", {
                    name: "Logout",
                })
            ).not.toBeInTheDocument();
        });
    });

    describe("logout confirmation", () => {
        it("should display the confirmation modal when clicking logout", async () => {
            const user = userEvent.setup();

            renderHeader();

            const userProfile = document.querySelector(
                ".user-profile"
            ) as HTMLElement;

            await user.click(userProfile);

            const logoutMenuButton = screen.getByRole("button", {
                name: "Logout",
            });

            await user.click(logoutMenuButton);

            expect(
                screen.getByText("Are you sure you want to logout?")
            ).toBeInTheDocument();

            expect(
                screen.getAllByRole("button", {
                    name: "Logout",
                })
            ).toHaveLength(2);
        });

        it("should close the confirmation modal when clicking Stay here", async () => {
            const user = userEvent.setup();

            renderHeader();

            const userProfile = document.querySelector(
                ".user-profile"
            ) as HTMLElement;

            await user.click(userProfile);

            await user.click(
                screen.getByRole("button", {
                    name: "Logout",
                })
            );

            expect(
                screen.getByText("Are you sure you want to logout?")
            ).toBeInTheDocument();

            await user.click(
                screen.getByRole("button", {
                    name: "Stay here",
                })
            );

            expect(
                screen.queryByText("Are you sure you want to logout?")
            ).not.toBeInTheDocument();
        });
    });

    describe("logout", () => {
        it("should call logout when confirming logout", async () => {
            const user = userEvent.setup();

            vi.mocked(logout).mockResolvedValue();

            renderHeader();

            const userProfile = document.querySelector(
                ".user-profile"
            ) as HTMLElement;

            await user.click(userProfile);

            await user.click(
                screen.getByRole("button", {
                    name: "Logout",
                })
            );

            const logoutButtons = screen.getAllByRole("button", {
                name: "Logout",
            });

            await user.click(logoutButtons[logoutButtons.length - 1]);

            expect(logout).toHaveBeenCalledTimes(1);
        });

        it("should navigate to login after successful logout", async () => {
            const user = userEvent.setup();

            vi.mocked(logout).mockResolvedValue();

            renderHeader();

            const userProfile = document.querySelector(
                ".user-profile"
            ) as HTMLElement;

            await user.click(userProfile);

            await user.click(
                screen.getByRole("button", {
                    name: "Logout",
                })
            );

            const logoutButtons = screen.getAllByRole("button", {
                name: "Logout",
            });

            await user.click(logoutButtons[logoutButtons.length - 1]);

            expect(navigate).toHaveBeenCalledWith("/login");
        });

        it("should close the logout menu after successful logout", async () => {
            const user = userEvent.setup();

            vi.mocked(logout).mockResolvedValue();

            renderHeader();

            const userProfile = document.querySelector(
                ".user-profile"
            ) as HTMLElement;

            await user.click(userProfile);

            await user.click(
                screen.getByRole("button", {
                    name: "Logout",
                })
            );

            const logoutButtons = screen.getAllByRole("button", {
                name: "Logout",
            });

            await user.click(logoutButtons[logoutButtons.length - 1]);

            expect(
                screen.queryByText("Are you sure you want to logout?")
            ).not.toBeInTheDocument();

            expect(
                screen.queryByRole("button", {
                    name: "Logout",
                })
            ).not.toBeInTheDocument();
        });
    });
});