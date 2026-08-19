import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import "@testing-library/jest-dom";

import TaskBoard from "../../../../src/components/tasksComponents/taskBoard/TaskBoard";
import type Task from "../../../../src/types/task";
import { useTaskRefreshContext } from "../../../../src/contexts/TaskRefreshContext/useTaskRefreshContext";
import {
    getProjectTaskStatusByProjectId,
    getProjectTaskStatusByPK,
    createProjectTaskStatus,
    updateProjectTaskStatus,
    deleteProjectTaskStatus,
} from "../../../../src/services/taskStatusService";
import { updateTask } from "../../../../src/services/taskService";
import { notify } from "../../../../src/utils/notify";

vi.mock(
    "../../../../src/contexts/TaskRefreshContext/useTaskRefreshContext",
    () => ({
        useTaskRefreshContext: vi.fn(),
    })
);

vi.mock(
    "../../../../src/services/boardColumnService",
    () => ({
        getProjectTaskStatusByProjectId: vi.fn(),
        getProjectTaskStatusByPK: vi.fn(),
        createProjectTaskStatus: vi.fn(),
        updateProjectTaskStatus: vi.fn(),
        deleteProjectTaskStatus: vi.fn(),
    })
);

vi.mock(
    "../../../../src/services/taskStatusService",
    () => ({
        getProjectTaskStatusByProjectId: vi.fn(),
        getProjectTaskStatusByPK: vi.fn(),
        createProjectTaskStatus: vi.fn(),
        updateProjectTaskStatus: vi.fn(),
        deleteProjectTaskStatus: vi.fn(),
    })
);
vi.mock(
    "../../../../src/services/taskService",
    () => ({
        updateTask: vi.fn(),
    })
);
vi.mock("../../../../src/utils/notify", () => ({
    notify: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

describe("TaskBoard", () => {
    const mockFetchTasks = vi.fn();
    const mockSetKey = vi.fn();

    const tasks: Task[] = [
        {
            id: "task-1",
            title: "To Do Task",
            description: "To Do description",
            status: "todo",
            priority: "high",
            estimatedTime: 120,
            dueDate: null,
            projectId: "project-1",
            createdAt: "2026-08-10T10:00:00.000Z",
            updatedAt: "2026-08-10T10:00:00.000Z",
        },
        {
            id: "task-2",
            title: "In Progress Task",
            description: "In progress description",
            status: "in_progress",
            priority: "medium",
            estimatedTime: 60,
            dueDate: null,
            projectId: "project-1",
            createdAt: "2026-08-10T10:00:00.000Z",
            updatedAt: "2026-08-10T10:00:00.000Z",
        },
        {
            id: "task-3",
            title: "Done Task",
            description: "Done description",
            status: "done",
            priority: "low",
            estimatedTime: 30,
            dueDate: null,
            projectId: "project-1",
            createdAt: "2026-08-10T10:00:00.000Z",
            updatedAt: "2026-08-10T10:00:00.000Z",
        },
    ];

    const taskStatuses = [
        {
            status: "todo",
            order: 0,
        },
        {
            status: "in_progress",
            order: 1,
        },
        {
            status: "done",
            order: 2,
        },
        {
            status: "testing",
            order: 3,
        },
    ];

    const renderTaskBoard = (
        boardTasks: Task[] = tasks,
        initialEntry = "/projects/project-1"
    ) => {
        return render(
            <MemoryRouter initialEntries={[initialEntry]}>
                <Routes>
                    <Route
                        path="/projects/:projectId"
                        element={
                            <TaskBoard
                                projectId="project-1"
                                tasks={boardTasks}
                                fetchTasks={mockFetchTasks}
                            />
                        }
                    />
                </Routes>
            </MemoryRouter>
        );
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("initial state", () => {
        it("should call fetchTasks when the component mounts", () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: mockSetKey,
            });

            vi.mocked(
                getProjectTaskStatusByProjectId
            ).mockResolvedValue(taskStatuses as any);

            renderTaskBoard();

            expect(mockFetchTasks).toHaveBeenCalledTimes(1);
        });

        it("should fetch task statuses when the component mounts", async () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: mockSetKey,
            });

            vi.mocked(
                getProjectTaskStatusByProjectId
            ).mockResolvedValue(taskStatuses as any);

            renderTaskBoard();

            await waitFor(() => {
                expect(
                    getProjectTaskStatusByProjectId
                ).toHaveBeenCalledWith("project-1");
            });
        });

        it("should render tasks from all statuses", async () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: mockSetKey,
            });

            vi.mocked(
                getProjectTaskStatusByProjectId
            ).mockResolvedValue(taskStatuses as any);

            renderTaskBoard();

            await waitFor(() => {
                expect(
                    screen.getByText("To Do Task")
                ).toBeInTheDocument();

                expect(
                    screen.getByText("In Progress Task")
                ).toBeInTheDocument();

                expect(
                    screen.getByText("Done Task")
                ).toBeInTheDocument();
            });
        });
    });

    describe("task refresh", () => {
        it("should call fetchTasks again when refresh key changes", () => {
            const mockContext = vi.mocked(
                useTaskRefreshContext
            );

            mockContext.mockReturnValue({
                key: 0,
                setKey: mockSetKey,
            });

            vi.mocked(
                getProjectTaskStatusByProjectId
            ).mockResolvedValue(taskStatuses as any);

            const { rerender } = renderTaskBoard();

            expect(mockFetchTasks).toHaveBeenCalledTimes(1);

            mockContext.mockReturnValue({
                key: 1,
                setKey: mockSetKey,
            });

            rerender(
                <MemoryRouter
                    initialEntries={[
                        "/projects/project-1",
                    ]}
                >
                    <Routes>
                        <Route
                            path="/projects/:projectId"
                            element={
                                <TaskBoard
                                    projectId="project-1"
                                    tasks={tasks}
                                    fetchTasks={
                                        mockFetchTasks
                                    }
                                />
                            }
                        />
                    </Routes>
                </MemoryRouter>
            );

            expect(mockFetchTasks).toHaveBeenCalledTimes(2);
        });
    });

    describe("task statuses", () => {
        it("should fetch statuses for the current project", async () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: mockSetKey,
            });

            vi.mocked(
                getProjectTaskStatusByProjectId
            ).mockResolvedValue(taskStatuses as any);

            renderTaskBoard();

            await waitFor(() => {
                expect(
                    getProjectTaskStatusByProjectId
                ).toHaveBeenCalledWith("project-1");
            });
        });

        it("should handle an error while fetching statuses", async () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: mockSetKey,
            });

            vi.mocked(
                getProjectTaskStatusByProjectId
            ).mockRejectedValue(
                new Error("Failed to fetch statuses")
            );

            renderTaskBoard();

            await waitFor(() => {
                expect(
                    getProjectTaskStatusByProjectId
                ).toHaveBeenCalledWith("project-1");
            });
        });
    });

    describe("task status operations", () => {
        it("should call getProjectTaskStatusByPK when a status is requested", async () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: mockSetKey,
            });

            vi.mocked(
                getProjectTaskStatusByProjectId
            ).mockResolvedValue(taskStatuses as any);

            vi.mocked(
                getProjectTaskStatusByPK
            ).mockResolvedValue(taskStatuses[0] as any);

            renderTaskBoard();

            await waitFor(() => {
                expect(
                    getProjectTaskStatusByProjectId
                ).toHaveBeenCalled();
            });

            const status = await getProjectTaskStatusByPK(
                "project-1",
                "todo"
            );

            expect(status).toEqual(taskStatuses[0]);
            expect(
                getProjectTaskStatusByPK
            ).toHaveBeenCalledWith(
                "project-1",
                "todo"
            );
        });

        it("should create a task status", async () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: mockSetKey,
            });

            vi.mocked(
                getProjectTaskStatusByProjectId
            ).mockResolvedValue(taskStatuses as any);

            vi.mocked(
                createProjectTaskStatus
            ).mockResolvedValue({
                status: "testing",
                order: 3,
            } as any);

            renderTaskBoard();

            await createProjectTaskStatus(
                "project-1",
                {
                    status: "testing",
                } as any
            );

            expect(
                createProjectTaskStatus
            ).toHaveBeenCalledWith(
                "project-1",
                {
                    status: "testing",
                }
            );
        });

        it("should update a task status", async () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: mockSetKey,
            });

            vi.mocked(
                getProjectTaskStatusByProjectId
            ).mockResolvedValue(taskStatuses as any);

            vi.mocked(
                updateProjectTaskStatus
            ).mockResolvedValue({
                status: "testing",
                order: 2,
            } as any);

            renderTaskBoard();

            await updateProjectTaskStatus(
                "project-1",
                "in_progress",
                {
                    status: "testing",
                } as any
            );

            expect(
                updateProjectTaskStatus
            ).toHaveBeenCalledWith(
                "project-1",
                "in_progress",
                {
                    status: "testing",
                }
            );
        });

        it("should delete a task status", async () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: mockSetKey,
            });

            vi.mocked(
                getProjectTaskStatusByProjectId
            ).mockResolvedValue(taskStatuses as any);

            vi.mocked(
                deleteProjectTaskStatus
            ).mockResolvedValue();

            renderTaskBoard();

            await deleteProjectTaskStatus(
                "project-1",
                "in_progress"
            );

            expect(
                deleteProjectTaskStatus
            ).toHaveBeenCalledWith(
                "project-1",
                "in_progress"
            );
        });
    });

    describe("task updates", () => {
        it("should update a task status", async () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: mockSetKey,
            });

            vi.mocked(
                getProjectTaskStatusByProjectId
            ).mockResolvedValue(taskStatuses as any);

            vi.mocked(updateTask).mockResolvedValue(
                tasks[0]
            );

            renderTaskBoard();

            await updateTask(
                "task-1",
                {
                    status: "done",
                },
                "project-1",
            );

            expect(updateTask).toHaveBeenCalledWith(
                "task-1",
                {
                    status: "done",
                },
                "project-1"
            );
        });

        it("should update a task when moving it between statuses", async () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: mockSetKey,
            });

            vi.mocked(
                getProjectTaskStatusByProjectId
            ).mockResolvedValue(taskStatuses as any);

            vi.mocked(updateTask).mockResolvedValue(
                {
                    ...tasks[0],
                    status: "done",
                }
            );

            renderTaskBoard();

            await updateTask(
                "task-1",
                {
                    status: "done",
                },
                "project-1"
            );

            expect(updateTask).toHaveBeenCalledTimes(1);
            expect(updateTask).toHaveBeenCalledWith(
                "task-1",
                {
                    status: "done",
                },
                "project-1",
            );
        });
    });

    describe("column operations", () => {
        beforeEach(() => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: mockSetKey,
            });

            vi.mocked(
                getProjectTaskStatusByProjectId
            ).mockResolvedValue(taskStatuses as any);
        });

        it("should not show update or delete controls for the main columns", async () => {
            renderTaskBoard();

            await waitFor(() => {
                expect(
                    screen.getByText("Todo")
                ).toBeInTheDocument();

                expect(
                    screen.getByText("In progress")
                ).toBeInTheDocument();

                expect(
                    screen.getByText("Done")
                ).toBeInTheDocument();
            });

            expect(
                screen.queryByRole("button", {
                    name: /edit.*todo/i,
                })
            ).not.toBeInTheDocument();

            expect(
                screen.queryByRole("button", {
                    name: /delete.*todo/i,
                })
            ).not.toBeInTheDocument();

            expect(
                screen.queryByRole("button", {
                    name: /edit.*in.progress/i,
                })
            ).not.toBeInTheDocument();

            expect(
                screen.queryByRole("button", {
                    name: /delete.*in.progress/i,
                })
            ).not.toBeInTheDocument();

            expect(
                screen.queryByRole("button", {
                    name: /edit.*done/i,
                })
            ).not.toBeInTheDocument();

            expect(
                screen.queryByRole("button", {
                    name: /delete.*done/i,
                })
            ).not.toBeInTheDocument();
        });

        it("should show update and delete controls after clicking a custom column", async () => {
            renderTaskBoard();

            const customColumn = await screen.findByText("Testing");

            fireEvent.click(customColumn);

            expect(
                screen.getAllByText("Delete")[0]
            ).toBeInTheDocument();
        });

        it("should update a custom column", async () => {
            vi.mocked(updateProjectTaskStatus).mockResolvedValue({
                status: "review",
                order: 3,
            } as any);

            renderTaskBoard();

            fireEvent.click(
                await screen.findByText("Testing")
            );

            const input = document.querySelector(
                "input[type='text'][id='column-name']"
            ) as HTMLInputElement;

            fireEvent.change(input, {
                target: {
                    value: "review",
                },
            });

            fireEvent.click(
                screen.getByRole("button", {
                    name: "Update",
                })
            );

            await waitFor(() => {
                expect(
                    updateProjectTaskStatus
                ).toHaveBeenCalledWith(
                    "project-1",
                    "testing",
                    expect.objectContaining({
                        status: "review",
                    })
                );
            });
        });

        it("should delete a custom column", async () => {
            vi.mocked(
                deleteProjectTaskStatus
            ).mockResolvedValue();

            renderTaskBoard();

            fireEvent.click(
                await screen.findByText("Testing")
            );

            const deleteButton = await screen.findByText("Delete");

            fireEvent.click(deleteButton);

            const confirmButton = await screen.findAllByRole(
                "button",
                {
                    name: "Delete",
                }
            )

            fireEvent.click(confirmButton[1]);

            await waitFor(() => {
                expect(
                    deleteProjectTaskStatus
                ).toHaveBeenCalledWith(
                    "project-1",
                    "testing"
                );
            });
        });

        it("should refresh after updating a custom column", async () => {
            vi.mocked(updateProjectTaskStatus).mockResolvedValue({
                status: "review",
                order: 3,
            } as any);

            renderTaskBoard();

            fireEvent.click(
                await screen.findByText("Testing")
            );

            const input = document.querySelector(
                "input[type='text'][id='column-name']"
            ) as HTMLInputElement;

            fireEvent.change(input, {
                target: {
                    value: "review",
                },
            });

            fireEvent.click(
                screen.getByRole("button", {
                    name: "Update",
                })
            );

            await waitFor(() => {
                expect(
                    updateProjectTaskStatus
                ).toHaveBeenCalled();
            });

        });

        it("should refresh after deleting a custom column", async () => {
            vi.mocked(
                deleteProjectTaskStatus
            ).mockResolvedValue();

            renderTaskBoard();

            fireEvent.click(
                await screen.findByText("Testing")
            );

            fireEvent.click(
                screen.getAllByText("Delete")[0]
            );

            fireEvent.click(
                screen.getAllByText("Delete")[1]
            );

            await waitFor(() => {
                expect(
                    deleteProjectTaskStatus
                ).toHaveBeenCalledWith(
                    "project-1",
                    "testing"
                );
            });
        });
    });

    describe("board column fetch errors", () => {
        beforeEach(() => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: mockSetKey,
            });
        });

        it("should show a 'not found' error when fetching columns returns a 404", async () => {
            vi.mocked(getProjectTaskStatusByProjectId).mockRejectedValue({
                isAxiosError: true,
                response: { status: 404 },
            });

            renderTaskBoard();

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "Board columns not found"
                );
            });
        });

        it("should show an 'unauthorized' error when fetching columns returns a 401", async () => {
            vi.mocked(getProjectTaskStatusByProjectId).mockRejectedValue({
                isAxiosError: true,
                response: { status: 401 },
            });

            renderTaskBoard();

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "Unauthorized access"
                );
            });
        });

        it("should show a generic error for other axios error statuses", async () => {
            vi.mocked(getProjectTaskStatusByProjectId).mockRejectedValue({
                isAxiosError: true,
                response: { status: 500 },
            });

            renderTaskBoard();

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "Error fetching board columns"
                );
            });
        });

        it("should show a generic error for non-axios errors", async () => {
            vi.mocked(getProjectTaskStatusByProjectId).mockRejectedValue(
                new Error("network down")
            );

            renderTaskBoard();

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "Error fetching board columns"
                );
            });
        });
    });

    describe("column deletion errors", () => {
        beforeEach(() => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: mockSetKey,
            });

            vi.mocked(getProjectTaskStatusByProjectId).mockResolvedValue(
                taskStatuses as any
            );
        });

        const openDeleteConfirm = async () => {
            fireEvent.click(await screen.findByText("Testing"));
            fireEvent.click(await screen.findByText("Delete"));
            return screen.findAllByRole("button", { name: "Delete" });
        };

        it("should show a specific message when deleting a column that still has tasks (409)", async () => {
            vi.mocked(deleteProjectTaskStatus).mockRejectedValue({
                isAxiosError: true,
                response: { status: 409 },
            });

            renderTaskBoard();

            const confirmButtons = await openDeleteConfirm();
            fireEvent.click(confirmButtons[1]);

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "Cannot delete column with tasks. Please move or delete all tasks in this column first."
                );
            });
        });

        it("should show a 'not found' message when deleting a column that no longer exists (404)", async () => {
            vi.mocked(deleteProjectTaskStatus).mockRejectedValue({
                isAxiosError: true,
                response: { status: 404 },
            });

            renderTaskBoard();

            const confirmButtons = await openDeleteConfirm();
            fireEvent.click(confirmButtons[1]);

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "Board column not found"
                );
            });
        });

        it("should show a generic error message for other delete failures", async () => {
            vi.mocked(deleteProjectTaskStatus).mockRejectedValue(
                new Error("boom")
            );

            renderTaskBoard();

            const confirmButtons = await openDeleteConfirm();
            fireEvent.click(confirmButtons[1]);

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "Error deleting board column"
                );
            });
        });
    });

    describe("column creation via the form", () => {
        beforeEach(() => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: mockSetKey,
            });

            vi.mocked(getProjectTaskStatusByProjectId).mockResolvedValue(
                taskStatuses as any
            );
        });

        it("should open the create column form when the '+' button is clicked", async () => {
            renderTaskBoard();

            fireEvent.click(await screen.findByText("+"));

            expect(
                document.querySelector(
                    "input[type='text'][id='column-name']"
                )
            ).toBeInTheDocument();
        });

        it("should not create a column when the status is empty", async () => {
            renderTaskBoard();

            fireEvent.click(await screen.findByText("+"));

            fireEvent.click(
                screen.getByRole("button", { name: "Create" })
            );

            expect(createProjectTaskStatus).not.toHaveBeenCalled();
        });

        it("should not create a column with a status that already exists", async () => {
            renderTaskBoard();

            fireEvent.click(await screen.findByText("+"));

            const input = document.querySelector(
                "input[type='text'][id='column-name']"
            ) as HTMLInputElement;

            fireEvent.change(input, { target: { value: "todo" } });

            fireEvent.click(
                screen.getByRole("button", { name: "Create" })
            );

            expect(notify.error).toHaveBeenCalledWith(
                "A column with this status already exists."
            );
            expect(createProjectTaskStatus).not.toHaveBeenCalled();
        });

        it("should create a new column through the form with the next order index", async () => {
            vi.mocked(createProjectTaskStatus).mockResolvedValue({
                status: "backlog",
                order: taskStatuses.length,
            } as any);

            renderTaskBoard();

            fireEvent.click(await screen.findByText("+"));

            const input = document.querySelector(
                "input[type='text'][id='column-name']"
            ) as HTMLInputElement;

            fireEvent.change(input, { target: { value: "backlog" } });

            fireEvent.click(
                screen.getByRole("button", { name: "Create" })
            );

            await waitFor(() => {
                expect(createProjectTaskStatus).toHaveBeenCalledWith(
                    "project-1",
                    {
                        status: "backlog",
                        order: taskStatuses.length,
                    }
                );
            });
        });

        it("should trim whitespace and lowercase the status before creating", async () => {
            vi.mocked(createProjectTaskStatus).mockResolvedValue({
                status: "backlog",
                order: taskStatuses.length,
            } as any);

            renderTaskBoard();

            fireEvent.click(await screen.findByText("+"));

            const input = document.querySelector(
                "input[type='text'][id='column-name']"
            ) as HTMLInputElement;

            fireEvent.change(input, { target: { value: "  Backlog  " } });

            fireEvent.click(
                screen.getByRole("button", { name: "Create" })
            );

            await waitFor(() => {
                expect(createProjectTaskStatus).toHaveBeenCalledWith(
                    "project-1",
                    {
                        status: "backlog",
                        order: taskStatuses.length,
                    }
                );
            });
        });
    });

    describe("column update validation", () => {
        beforeEach(() => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: mockSetKey,
            });

            vi.mocked(getProjectTaskStatusByProjectId).mockResolvedValue(
                taskStatuses as any
            );
        });

        it("should not update a column to a status that already exists", async () => {
            renderTaskBoard();

            fireEvent.click(await screen.findByText("Testing"));

            const input = document.querySelector(
                "input[type='text'][id='column-name']"
            ) as HTMLInputElement;

            fireEvent.change(input, { target: { value: "todo" } });

            fireEvent.click(
                screen.getByRole("button", { name: "Update" })
            );

            expect(notify.error).toHaveBeenCalledWith(
                "A column with this status already exists."
            );
            expect(updateProjectTaskStatus).not.toHaveBeenCalled();
        });

        it("should not update a column when the new status is empty", async () => {
            renderTaskBoard();

            fireEvent.click(await screen.findByText("Testing"));

            const input = document.querySelector(
                "input[type='text'][id='column-name']"
            ) as HTMLInputElement;

            fireEvent.change(input, { target: { value: "" } });

            fireEvent.click(
                screen.getByRole("button", { name: "Update" })
            );

            expect(updateProjectTaskStatus).not.toHaveBeenCalled();
        });

        it("should allow re-submitting a column with its own unchanged status", async () => {
            vi.mocked(updateProjectTaskStatus).mockResolvedValue({
                status: "testing",
                order: 3,
            } as any);

            renderTaskBoard();

            fireEvent.click(await screen.findByText("Testing"));

            fireEvent.click(
                screen.getByRole("button", { name: "Update" })
            );

            await waitFor(() => {
                expect(updateProjectTaskStatus).toHaveBeenCalledWith(
                    "project-1",
                    "testing",
                    expect.objectContaining({ status: "testing" })
                );
            });
        });
    });

    describe("task navigation", () => {
        const LocationDisplay = () => {
            const location = useLocation();
            return (
                <div data-testid="location-display">
                    {location.pathname}
                    {location.search}
                </div>
            );
        };

        beforeEach(() => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: mockSetKey,
            });

            vi.mocked(getProjectTaskStatusByProjectId).mockResolvedValue(
                taskStatuses as any
            );
        });

        it("should add a taskId query param to the URL when a task card is clicked", async () => {
            render(
                <MemoryRouter initialEntries={["/projects/project-1"]}>
                    <Routes>
                        <Route
                            path="/projects/:projectId"
                            element={
                                <>
                                    <TaskBoard
                                        projectId="project-1"
                                        tasks={tasks}
                                        fetchTasks={mockFetchTasks}
                                    />
                                    <LocationDisplay />
                                </>
                            }
                        />
                    </Routes>
                </MemoryRouter>
            );

            fireEvent.click(await screen.findByText("To Do Task"));

            await waitFor(() => {
                expect(
                    screen.getByTestId("location-display")
                ).toHaveTextContent("taskId=task-1");
            });
        });

        it("should preserve existing query params when opening a different task", async () => {
            render(
                <MemoryRouter
                    initialEntries={["/projects/project-1?filter=mine"]}
                >
                    <Routes>
                        <Route
                            path="/projects/:projectId"
                            element={
                                <>
                                    <TaskBoard
                                        projectId="project-1"
                                        tasks={tasks}
                                        fetchTasks={mockFetchTasks}
                                    />
                                    <LocationDisplay />
                                </>
                            }
                        />
                    </Routes>
                </MemoryRouter>
            );

            fireEvent.click(await screen.findByText("Done Task"));

            await waitFor(() => {
                const display = screen.getByTestId("location-display");
                expect(display).toHaveTextContent("filter=mine");
                expect(display).toHaveTextContent("taskId=task-3");
            });
        });
    });

});