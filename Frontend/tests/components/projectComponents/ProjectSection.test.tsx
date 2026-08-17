import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import ProjectShowSection from "../../../src/components/projectComponents/ProjectShowSection";
import { getProjectById } from "../../../src/services/projectService";
import { notify } from "../../../src/utils/notify";

vi.mock("../../../src/services/projectService", () => ({
    getProjectById: vi.fn(),
}));

vi.mock("../../../src/utils/notify", () => ({
    notify: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

const mockSetKey = vi.fn();

vi.mock(
    "../../../src/contexts/RefreshContext/useRefreshContext",
    () => ({
        useRefreshContext: () => ({
            setKey: mockSetKey,
        }),
    })
);

vi.mock(
    "../../../src/components/projectComponents/ProjectShow",
    () => ({
        default: ({
            project,
            deleteRefresh,
            onUpdated,
        }: {
            project: {
                id: string;
                name: string;
                description?: string;
            };
            deleteRefresh: () => void;
            onUpdated: (project: {
                id: string;
                name: string;
                description?: string;
            }) => void;
        }) => (
            <div data-testid="project-show">
                <p>{project.name}</p>

                <button onClick={deleteRefresh}>
                    Delete Project
                </button>

                <button
                    onClick={() =>
                        onUpdated({
                            ...project,
                            name: "Updated Project",
                        })
                    }
                >
                    Update Project
                </button>
            </div>
        ),
    })
);

describe("ProjectShowSection", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    const mockProject = {
        id: "project-1",
        name: "Test Project",
        description: "Test project description",
    };

    const renderProjectShowSection = (
        initialEntry = "/projects/project-1"
    ) => {
        return render(
            <MemoryRouter initialEntries={[initialEntry]}>
                <Routes>
                    <Route
                        path="/projects/:projectId"
                        element={<ProjectShowSection />}
                    />

                    <Route
                        path="/projects"
                        element={
                            <div data-testid="projects-page">
                                Projects Page
                            </div>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );
    };

    describe("initial state", () => {
        it("should display the select project message before the project is loaded", () => {
            vi.mocked(getProjectById).mockReturnValue(
                new Promise(() => {})
            );

            renderProjectShowSection();

            expect(
                screen.getByText(
                    "Select a project to view its details."
                )
            ).toBeInTheDocument();
        });

        it("should not fetch a project when projectId is missing", () => {
            render(
                <MemoryRouter initialEntries={["/projects"]}>
                    <Routes>
                        <Route
                            path="/projects"
                            element={<ProjectShowSection />}
                        />
                    </Routes>
                </MemoryRouter>
            );

            expect(getProjectById).not.toHaveBeenCalled();

            expect(
                screen.getByText(
                    "Select a project to view its details."
                )
            ).toBeInTheDocument();
        });

        it("should not fetch a project when projectId is undefined", () => {
            render(
                <MemoryRouter
                    initialEntries={["/projects/undefined"]}
                >
                    <Routes>
                        <Route
                            path="/projects/:projectId"
                            element={<ProjectShowSection />}
                        />
                    </Routes>
                </MemoryRouter>
            );

            expect(getProjectById).not.toHaveBeenCalled();
        });
    });

    describe("fetching project", () => {
        it("should fetch the project using the projectId", async () => {
            vi.mocked(getProjectById).mockResolvedValue(
                mockProject
            );

            renderProjectShowSection();

            await waitFor(() => {
                expect(getProjectById).toHaveBeenCalledWith(
                    "project-1"
                );
            });
        });

        it("should render ProjectShow after successfully fetching the project", async () => {
            vi.mocked(getProjectById).mockResolvedValue(
                mockProject
            );

            renderProjectShowSection();

            expect(
                await screen.findByTestId("project-show")
            ).toBeInTheDocument();

            expect(
                screen.getByText("Test Project")
            ).toBeInTheDocument();
        });

        it("should pass the fetched project to ProjectShow", async () => {
            vi.mocked(getProjectById).mockResolvedValue(
                mockProject
            );

            renderProjectShowSection();

            expect(
                await screen.findByText("Test Project")
            ).toBeInTheDocument();
        });
    });

    describe("project fetch errors", () => {
        it("should display an error notification when fetching the project fails", async () => {
            vi.mocked(getProjectById).mockRejectedValue(
                new Error("Project not found")
            );

            renderProjectShowSection();

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "Project not found or has been deleted. Please select another project."
                );
            });
        });
    });

    describe("project deletion", () => {
        it("should navigate to the projects page when the project is deleted", async () => {
            const user = userEvent.setup();

            vi.mocked(getProjectById).mockResolvedValue(
                mockProject
            );

            renderProjectShowSection();

            await screen.findByTestId("project-show");

            await user.click(
                screen.getByRole("button", {
                    name: "Delete Project",
                })
            );

            expect(
                screen.getByTestId("projects-page")
            ).toBeInTheDocument();
        });
    });

    describe("project updates", () => {
        it("should update the displayed project", async () => {
            const user = userEvent.setup();

            vi.mocked(getProjectById).mockResolvedValue(
                mockProject
            );

            renderProjectShowSection();

            await screen.findByText("Test Project");

            await user.click(
                screen.getByRole("button", {
                    name: "Update Project",
                })
            );

            expect(
                screen.getByText("Updated Project")
            ).toBeInTheDocument();
        });

        it("should update the refresh key when the project is updated", async () => {
            const user = userEvent.setup();

            vi.mocked(getProjectById).mockResolvedValue(
                mockProject
            );

            renderProjectShowSection();

            await screen.findByText("Test Project");

            await user.click(
                screen.getByRole("button", {
                    name: "Update Project",
                })
            );

            expect(mockSetKey).toHaveBeenCalledTimes(1);

            const updater = mockSetKey.mock.calls[0][0];

            expect(updater(null)).toBe(1);
        });

        it("should increment the refresh key when the previous key is not null", async () => {
            const user = userEvent.setup();

            vi.mocked(getProjectById).mockResolvedValue(
                mockProject
            );

            renderProjectShowSection();

            await screen.findByText("Test Project");

            await user.click(
                screen.getByRole("button", {
                    name: "Update Project",
                })
            );

            const updater = mockSetKey.mock.calls[0][0];

            expect(updater(0)).toBe(1);
            expect(updater(1)).toBe(0);
        });
    });

    describe("unmount behavior", () => {
        it("should not update the project after the component is unmounted", async () => {
            let resolveProject:
                | ((project: typeof mockProject) => void)
                | undefined;

            vi.mocked(getProjectById).mockReturnValue(
                new Promise((resolve) => {
                    resolveProject = resolve;
                })
            );

            const { unmount } = renderProjectShowSection();

            unmount();

            resolveProject?.(mockProject);

            await waitFor(() => {
                expect(
                    screen.queryByTestId("project-show")
                ).not.toBeInTheDocument();
            });
        });
    });
});