import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import ProjectsSideBar from "../../../src/components/projectComponents/ProjectsSideBar";
import { getProjects } from "../../../src/services/projectService";
import { notify } from "../../../src/utils/notify";

vi.mock("../../../src/services/projectService", () => ({
    getProjects: vi.fn(),
}));

vi.mock("../../../src/utils/notify", () => ({
    notify: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

vi.mock("axios", () => ({
    default: {
        isAxiosError: vi.fn(),
    },
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

import axios from "axios";

vi.mock(
    "../../../src/components/projectComponents/SortByComponent",
    () => ({
        default: ({
            sortBy,
            sortOrder,
            setSortBy,
            setSortOrder,
            attributesList,
        }: {
            sortBy: string;
            sortOrder: string;
            setSortBy: (value: string) => void;
            setSortOrder: (value: string) => void;
            attributesList: string[];
        }) => (
            <div data-testid="sort-menu">
                <p>Sort By: {sortBy}</p>
                <p>Sort Order: {sortOrder}</p>

                {attributesList.map((attribute) => (
                    <button
                        key={attribute}
                        onClick={() => setSortBy(attribute)}
                    >
                        {attribute}
                    </button>
                ))}

                <button
                    onClick={() =>
                        setSortOrder(
                            sortOrder === "asc"
                                ? "desc"
                                : "asc"
                        )
                    }
                >
                    Toggle Sort Order
                </button>
            </div>
        ),
    })
);

vi.mock(
    "../../../src/components/projectComponents/ProjectCard",
    () => ({
        default: ({
            project,
        }: {
            project: {
                id: string;
                name: string;
            };
        }) => (
            <div data-testid={`project-${project.id}`}>
                {project.name}
            </div>
        ),
    })
);

vi.mock(
    "../../../src/components/projectComponents/ManageProjectCard",
    () => ({
        default: ({
            mode,
            onSuccess,
            onClose,
        }: {
            mode: string;
            onSuccess: () => void;
            onClose: () => void;
        }) => (
            <div data-testid="create-project-modal">
                <p>{mode}</p>

                <button onClick={onSuccess}>
                    Create Success
                </button>

                <button onClick={onClose}>
                    Close Create Modal
                </button>
            </div>
        ),
    })
);

const mockProjects = [
    {
        id: "project-1",
        name: "Project One",
        description: "First project",
    },
    {
        id: "project-2",
        name: "Project Two",
        description: "Second project",
    },
];

describe("ProjectsSideBar", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    const renderProjectsSideBar = (
        initialEntry = "/projects"
    ) => {
        return render(
            <MemoryRouter initialEntries={[initialEntry]}>
                <Routes>
                    <Route
                        path="/projects"
                        element={<ProjectsSideBar />}
                    />

                    <Route
                        path="/projects/:projectId"
                        element={<ProjectsSideBar />}
                    />
                </Routes>
            </MemoryRouter>
        );
    };

    describe("initial state", () => {
        it("should display the Projects heading", () => {
            vi.mocked(getProjects).mockResolvedValue({
                projects: [],
                total: 0,
            });

            renderProjectsSideBar();

            expect(
                screen.getByText("Projects")
            ).toBeInTheDocument();
        });

        it("should display zero projects initially", () => {
            vi.mocked(getProjects).mockResolvedValue({
                projects: [],
                total: 0,
            });

            renderProjectsSideBar();

            expect(
                screen.getByText("0 - 0 of 0")
            ).toBeInTheDocument();
        });

        it("should fetch projects on mount", async () => {
            vi.mocked(getProjects).mockResolvedValue({
                projects: mockProjects,
                total: 2,
            });

            renderProjectsSideBar();

            await waitFor(() => {
                expect(getProjects).toHaveBeenCalledWith({
                    page: 1,
                    pageSize: expect.any(Number),
                    sortBy: "createdAt",
                    sortOrder: "desc",
                });
            });
        });

        it("should display fetched projects", async () => {
            vi.mocked(getProjects).mockResolvedValue({
                projects: mockProjects,
                total: 2,
            });

            renderProjectsSideBar();

            expect(
                await screen.findByText("Project One")
            ).toBeInTheDocument();

            expect(
                screen.getByText("Project Two")
            ).toBeInTheDocument();
        });

        it("should display the correct project count", async () => {
            vi.mocked(getProjects).mockResolvedValue({
                projects: mockProjects,
                total: 2,
            });

            renderProjectsSideBar();

            await screen.findByText("Project One");

            expect(
                screen.getByText("1 - 2 of 2")
            ).toBeInTheDocument();
        });
    });

    describe("sorting", () => {
        it("should not display the sort menu initially", () => {
            vi.mocked(getProjects).mockResolvedValue({
                projects: [],
                total: 0,
            });

            renderProjectsSideBar();

            expect(
                screen.queryByTestId("sort-menu")
            ).not.toBeInTheDocument();
        });

        it("should display the sort menu when the sort icon is clicked", async () => {
            const user = userEvent.setup();

            vi.mocked(getProjects).mockResolvedValue({
                projects: [],
                total: 0,
            });

            renderProjectsSideBar();

            const sortIcon = document.querySelector(
                ".tools-button svg:nth-of-type(3)"
            );

            expect(sortIcon).toBeInTheDocument();

            await user.click(sortIcon!);

            expect(
                screen.getByTestId("sort-menu")
            ).toBeInTheDocument();
        });

        it("should hide the sort menu when clicking outside", async () => {
            const user = userEvent.setup();

            vi.mocked(getProjects).mockResolvedValue({
                projects: [],
                total: 0,
            });

            renderProjectsSideBar();

            const sortIcon = document.querySelector(
                ".tools-button svg:nth-of-type(3)"
            );

            await user.click(sortIcon!);

            expect(
                screen.getByTestId("sort-menu")
            ).toBeInTheDocument();

            await user.click(
                screen.getByText("Projects")
            );

            expect(
                screen.queryByTestId("sort-menu")
            ).not.toBeInTheDocument();
        });

        it("should fetch projects again when sortBy changes", async () => {
            const user = userEvent.setup();

            vi.mocked(getProjects).mockResolvedValue({
                projects: [],
                total: 0,
            });

            renderProjectsSideBar();

            await waitFor(() => {
                expect(getProjects).toHaveBeenCalledTimes(1);
            });

            const sortIcon = document.querySelector(
                ".tools-button svg:nth-of-type(3)"
            );

            await user.click(sortIcon!);

            await user.click(
                screen.getByRole("button", {
                    name: "name",
                })
            );

            await waitFor(() => {
                expect(getProjects).toHaveBeenCalledWith(
                    expect.objectContaining({
                        sortBy: "name",
                    })
                );
            });
        });

        it("should fetch projects again when sort order changes", async () => {
            const user = userEvent.setup();

            vi.mocked(getProjects).mockResolvedValue({
                projects: [],
                total: 0,
            });

            renderProjectsSideBar();

            await waitFor(() => {
                expect(getProjects).toHaveBeenCalledTimes(1);
            });

            const sortIcon = document.querySelector(
                ".tools-button svg:nth-of-type(3)"
            );

            await user.click(sortIcon!);

            await user.click(
                screen.getByRole("button", {
                    name: "Toggle Sort Order",
                })
            );

            await waitFor(() => {
                expect(getProjects).toHaveBeenCalledWith(
                    expect.objectContaining({
                        sortOrder: "asc",
                    })
                );
            });
        });
    });

    describe("pagination", () => {

        it("should display the previous page when the previous arrow is clicked", async () => {
            const user = userEvent.setup();

            vi.mocked(getProjects).mockResolvedValue({
                projects: mockProjects,
                total: 10,
            });

            renderProjectsSideBar(
                "/projects?page=2"
            );

            await screen.findByText("Project One");

            const arrows =
                document.querySelectorAll(
                    ".move-page svg"
                );

            await user.click(arrows[0]);

            await waitFor(() => {
                expect(getProjects).toHaveBeenCalledWith(
                    expect.objectContaining({
                        page: 1,
                    })
                );
            });
        });

        it("should not go to the previous page when already on page one", async () => {
            const user = userEvent.setup();

            vi.mocked(getProjects).mockResolvedValue({
                projects: mockProjects,
                total: 10,
            });

            renderProjectsSideBar();

            await screen.findByText("Project One");

            const arrows =
                document.querySelectorAll(
                    ".move-page svg"
                );

            await user.click(arrows[0]);

            expect(getProjects).toHaveBeenCalledTimes(1);
        });

        it("should not go to the next page when already on the last page", async () => {
            const user = userEvent.setup();

            vi.mocked(getProjects).mockResolvedValue({
                projects: mockProjects,
                total: 2,
            });

            renderProjectsSideBar();

            await screen.findByText("Project One");

            const arrows =
                document.querySelectorAll(
                    ".move-page svg"
                );

            await user.click(arrows[1]);

            expect(getProjects).toHaveBeenCalledTimes(1);
        });

        it("should move back one page when the current page has no projects", async () => {
            vi.mocked(getProjects)
                .mockResolvedValueOnce({
                    projects: [],
                    total: 5,
                })
                .mockResolvedValueOnce({
                    projects: mockProjects,
                    total: 5,
                });

            renderProjectsSideBar(
                "/projects?page=2"
            );

            await waitFor(() => {
                expect(getProjects).toHaveBeenCalledWith(
                    expect.objectContaining({
                        page: 2,
                    })
                );
            });

            await waitFor(() => {
                expect(getProjects).toHaveBeenCalledWith(
                    expect.objectContaining({
                        page: 1,
                    })
                );
            });
        });
    });

    describe("refresh", () => {
        it("should fetch projects again when the reload icon is clicked", async () => {
            const user = userEvent.setup();

            vi.mocked(getProjects).mockResolvedValue({
                projects: mockProjects,
                total: 2,
            });

            renderProjectsSideBar();

            await screen.findByText("Project One");

            expect(getProjects).toHaveBeenCalledTimes(1);

            const reloadIcon =
                document.querySelector(
                    ".tools-button svg"
                );

            expect(reloadIcon).toBeInTheDocument();

            await user.click(reloadIcon!);

            await waitFor(() => {
                expect(getProjects).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe("create project modal", () => {
        it("should display the create project modal when the add icon is clicked", async () => {
            const user = userEvent.setup();

            vi.mocked(getProjects).mockResolvedValue({
                projects: [],
                total: 0,
            });

            renderProjectsSideBar();

            const addIcon =
                document.querySelector(
                    ".tools-button svg:nth-of-type(2)"
                );

            expect(addIcon).toBeInTheDocument();

            await user.click(addIcon!);

            expect(
                screen.getByTestId(
                    "create-project-modal"
                )
            ).toBeInTheDocument();

            expect(
                screen.getByText("create")
            ).toBeInTheDocument();
        });

        it("should close the create project modal when onClose is triggered", async () => {
            const user = userEvent.setup();

            vi.mocked(getProjects).mockResolvedValue({
                projects: [],
                total: 0,
            });

            renderProjectsSideBar();

            const addIcon =
                document.querySelector(
                    ".tools-button svg:nth-of-type(2)"
                );

            await user.click(addIcon!);

            await user.click(
                screen.getByRole("button", {
                    name: "Close Create Modal",
                })
            );

            expect(
                screen.queryByTestId(
                    "create-project-modal"
                )
            ).not.toBeInTheDocument();
        });

        it("should fetch projects again after successfully creating a project", async () => {
            const user = userEvent.setup();

            vi.mocked(getProjects).mockResolvedValue({
                projects: [],
                total: 0,
            });

            renderProjectsSideBar();

            await waitFor(() => {
                expect(getProjects).toHaveBeenCalledTimes(1);
            });

            const addIcon =
                document.querySelector(
                    ".tools-button svg:nth-of-type(2)"
                );

            await user.click(addIcon!);

            await user.click(
                screen.getByRole("button", {
                    name: "Create Success",
                })
            );

            await waitFor(() => {
                expect(getProjects).toHaveBeenCalledTimes(2);
            });
        });

        it("should close the modal after successful project creation", async () => {
            const user = userEvent.setup();

            vi.mocked(getProjects).mockResolvedValue({
                projects: [],
                total: 0,
            });

            renderProjectsSideBar();

            const addIcon =
                document.querySelector(
                    ".tools-button svg:nth-of-type(2)"
                );

            await user.click(addIcon!);

            expect(
                screen.getByTestId(
                    "create-project-modal"
                )
            ).toBeInTheDocument();

            await user.click(
                screen.getByRole("button", {
                    name: "Create Success",
                })
            );

            expect(
                screen.queryByTestId(
                    "create-project-modal"
                )
            ).not.toBeInTheDocument();
        });
    });

    describe("error handling", () => {
        it("should display an authorization error for a 401 response", async () => {
            vi.mocked(axios.isAxiosError).mockReturnValue(
                true
            );

            vi.mocked(getProjects).mockRejectedValue({
                response: {
                    status: 401,
                },
            });

            renderProjectsSideBar();

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "You are not authorized to view the projects. Please log in."
                );
            });
        });

        it("should display a generic API error for a non-401 Axios error", async () => {
            vi.mocked(axios.isAxiosError).mockReturnValue(
                true
            );

            vi.mocked(getProjects).mockRejectedValue({
                response: {
                    status: 500,
                },
            });

            renderProjectsSideBar();

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "Failed to fetch projects. Please try again later."
                );
            });
        });

        it("should display an unexpected error for a non-Axios error", async () => {
            vi.mocked(axios.isAxiosError).mockReturnValue(
                false
            );

            vi.mocked(getProjects).mockRejectedValue(
                new Error("Unexpected error")
            );

            renderProjectsSideBar();

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "An unexpected error occurred. Please try again later."
                );
            });
        });
    });

    describe("URL parameters", () => {
        it("should initialize sort order from the URL", async () => {
            vi.mocked(getProjects).mockResolvedValue({
                projects: [],
                total: 0,
            });

            renderProjectsSideBar(
                "/projects?sortOrder=asc"
            );

            await waitFor(() => {
                expect(getProjects).toHaveBeenCalledWith(
                    expect.objectContaining({
                        sortOrder: "asc",
                    })
                );
            });
        });

        it("should initialize sortBy from the URL", async () => {
            vi.mocked(getProjects).mockResolvedValue({
                projects: [],
                total: 0,
            });

            renderProjectsSideBar(
                "/projects?sortBy=name"
            );

            await waitFor(() => {
                expect(getProjects).toHaveBeenCalledWith(
                    expect.objectContaining({
                        sortBy: "name",
                    })
                );
            });
        });

        it("should initialize the current page from the URL", async () => {
            vi.mocked(getProjects).mockResolvedValue({
                projects: [],
                total: 0,
            });

            renderProjectsSideBar(
                "/projects?page=3"
            );

            await waitFor(() => {
                expect(getProjects).toHaveBeenCalledWith(
                    expect.objectContaining({
                        page: 3,
                    })
                );
            });
        });

        it("should use createdAt when an invalid sortBy is provided", async () => {
            vi.mocked(getProjects).mockResolvedValue({
                projects: [],
                total: 0,
            });

            renderProjectsSideBar(
                "/projects?sortBy=invalid"
            );

            await waitFor(() => {
                expect(getProjects).toHaveBeenCalledWith(
                    expect.objectContaining({
                        sortBy: "createdAt",
                    })
                );
            });
        });

        it("should use desc when an invalid sortOrder is provided", async () => {
            vi.mocked(getProjects).mockResolvedValue({
                projects: [],
                total: 0,
            });

            renderProjectsSideBar(
                "/projects?sortOrder=invalid"
            );

            await waitFor(() => {
                expect(getProjects).toHaveBeenCalledWith(
                    expect.objectContaining({
                        sortOrder: "desc",
                    })
                );
            });
        });
    });
});