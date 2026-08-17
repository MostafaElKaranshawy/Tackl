import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";

import HomePage from "../../../src/pages/HomePage/HomePage";
import { checkAuthentication } from "../../../src/services/authService";

vi.mock("../../../src/services/authService", () => ({
    checkAuthentication: vi.fn(),
}));

const mockSetKey = vi.fn();

vi.mock(
    "../../../src/contexts/RefreshContext/useRefreshContext",
    () => ({
        useRefreshContext: () => ({
            key: null,
            setKey: mockSetKey,
        }),
    })
);

vi.mock("../../../src/components/Header", () => ({
    default: () => <div>Header</div>,
}));

vi.mock("../../../src/components/projectComponents/ProjectsSideBar", () => ({
    default: () => <div>Projects SideBar</div>,
}));

vi.mock("../../../src/components/projectComponents/ProjectSection", () => ({
    default: () => <div>Project Section</div>,
}));

vi.mock("../../../src/components/tasksComponents/TaskShowModal", () => ({
    default: () => <div>Task Show</div>,
}));

describe("HomePage", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    const renderHomePage = () => {
        return render(
            <MemoryRouter initialEntries={["/projects"]}>
                <Routes>
                    <Route
                        path="/projects"
                        element={<HomePage />}
                    />

                    <Route
                        path="/login"
                        element={<div>Login Page</div>}
                    />
                </Routes>
            </MemoryRouter>
        );
    };

    describe("loading state", () => {
        it("should display loading while checking authentication", () => {
            vi.mocked(checkAuthentication).mockReturnValue(
                new Promise(() => { })
            );

            renderHomePage();

            expect(
                screen.getByText("Loading...")
            ).toBeInTheDocument();
        });
    });

    describe("authentication", () => {
        it("should call checkAuthentication on mount", async () => {
            vi.mocked(checkAuthentication).mockResolvedValue(true);

            renderHomePage();

            expect(
                checkAuthentication
            ).toHaveBeenCalled();
        });

        it("should display the home page when authenticated", async () => {
            vi.mocked(checkAuthentication).mockResolvedValue(true);

            renderHomePage();

            expect(
                await screen.findByText("Header")
            ).toBeInTheDocument();

            expect(
                screen.getByText("Projects SideBar")
            ).toBeInTheDocument();

            expect(
                screen.getByText("Task Show")
            ).toBeInTheDocument();
        });

        it("should redirect unauthenticated users to login", async () => {
            vi.mocked(checkAuthentication).mockResolvedValue(false);

            renderHomePage();

            expect(
                await screen.findByText("Login Page")
            ).toBeInTheDocument();
        });
    });

    describe("authenticated state", () => {
        it("should not display access denied when authenticated", async () => {
            vi.mocked(checkAuthentication).mockResolvedValue(true);

            renderHomePage();

            expect(
                await screen.findByText("Header")
            ).toBeInTheDocument();

            expect(
                screen.queryByText("Access Denied")
            ).not.toBeInTheDocument();
        });
    });

    describe("unauthenticated state", () => {
        it("should not display home page when unauthenticated", async () => {
            vi.mocked(checkAuthentication).mockResolvedValue(false);

            renderHomePage();

            expect(
                await screen.findByText("Login Page")
            ).toBeInTheDocument();

            expect(
                screen.queryByText("Header")
            ).not.toBeInTheDocument();
        });
    });
});