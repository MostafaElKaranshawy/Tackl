import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import axios from "axios";

import TaskPage from "../../src/pages/TaskPage";
import { getTaskById, deleteTask } from "../../src/services/taskService";
import { useTaskRefreshContext } from "../../src/contexts/TaskRefreshContext/useTaskRefreshContext";
import Task from "../../src/types/task";
import ManageTaskCard from "../../src/components/tasksComponents/ManageTaskCard";

vi.mock("../../src/services/taskService", () => ({
    getTaskById: vi.fn(),
    deleteTask: vi.fn(),
}));

vi.mock(
    "../../src/contexts/TaskRefreshContext/useTaskRefreshContext",
    () => ({
        useTaskRefreshContext: vi.fn(),
    })
);

vi.mock("../../src/utils/notify", () => ({
    notify: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock("../../src/components/timeEntriesComponents/TimeEntriesList", () => ({
    default: () => <div>Time Entries</div>,
}));

vi.mock("../../src/components/taskHistoryComponents/TaskHistoryList", () => ({
    default: ({
        closeTaskHistoryList,
    }: {
        closeTaskHistoryList: () => void;
    }) => (
        <div>
            <p>Task History</p>
            <button onClick={closeTaskHistoryList}>Close History</button>
        </div>
    ),
}));

// vi.mock("../../src/components/tasksComponents/ManageTaskCard", () => ({
//     default: ({
//         onClose,
//         onSuccess,
//     }: {
//         onClose: () => void;
//         onSuccess: (task?: unknown) => void;
//     }) => (
//         <ManageTaskCard/>
//     ),
// }));

vi.mock(
    "../../src/components/generalPurposeComponents/ConfirmationModal",
    () => ({
        default: ({
            title,
            message,
            onConfirm,
            onCancel,
        }: {
            title?: string;
            message: string;
            onConfirm: () => void;
            onCancel: () => void;
        }) => (
            <div>
                <h2>{title}</h2>
                <p>{message}</p>
                <button onClick={onCancel}>Cancel</button>
                <button onClick={onConfirm}>Confirm</button>
            </div>
        ),
    })
);

const task = {
    id: "task-1",
    title: "Test Task",
    description: "Test task description",
    status: "to do",
    priority: "medium",
    estimatedTime: 120,
    dueDate: "2099-01-01T00:00:00.000Z",
    projectId: "project-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
} as Task;

describe("TaskPage", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    const renderTaskPage = () => {
        return render(
            <MemoryRouter
                initialEntries={[
                    "/projects/project-1/tasks/task-1?taskId=task-1",
                ]}
            >
                <Routes>
                    <Route
                        path="/projects/:projectId/tasks/:taskId"
                        element={<TaskPage />}
                    />
                    <Route
                        path="/projects/:projectId"
                        element={<div>Projects Page</div>}
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
        it("should display the task", async () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            vi.mocked(getTaskById).mockResolvedValue(task);

            renderTaskPage();

            expect(
                await screen.findByText("Test Task")
            ).toBeInTheDocument();

            expect(
                screen.getByText("Test task description")
            ).toBeInTheDocument();

            expect(
                screen.getByText("To do")
            ).toBeInTheDocument();

            expect(
                screen.getByText("medium")
            ).toBeInTheDocument();

            expect(
                screen.getByText("Details")
            ).toBeInTheDocument();
        });

        it("should call getTaskById with the correct parameters", async () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            vi.mocked(getTaskById).mockResolvedValue(task);

            renderTaskPage();

            await screen.findByText("Test Task");

            expect(getTaskById).toHaveBeenCalledWith(
                "task-1",
                "project-1"
            );
        });

        it("should display task not found before the task is loaded", () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            vi.mocked(getTaskById).mockImplementation(
                () => new Promise(() => { })
            );

            renderTaskPage();

            expect(
                screen.getByText("Task not found.")
            ).toBeInTheDocument();
        });
    });

    describe("task details", () => {
        it("should display N/A when description is empty", async () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            vi.mocked(getTaskById).mockResolvedValue({
                ...task,
                description: "",
            });

            renderTaskPage();

            expect(
                await screen.findByText("No description provided.")
            ).toBeInTheDocument();
        });

        it("should display N/A when due date is missing", async () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            vi.mocked(getTaskById).mockResolvedValue({
                ...task,
                dueDate: null,
            });

            renderTaskPage();

            expect(
                await screen.findByText("Test Task")
            ).toBeInTheDocument();

            expect(
                screen.getByText("N/A")
            ).toBeInTheDocument();
        });

        it("should display N/A when estimated time is missing", async () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            vi.mocked(getTaskById).mockResolvedValue({
                ...task,
                estimatedTime: null,
            });

            renderTaskPage();

            expect(
                await screen.findByText("Test Task")
            ).toBeInTheDocument();

            expect(
                screen.getAllByText("N/A").length
            ).toBeGreaterThan(0);
        });
    });

    describe("edit task", () => {
        it("should display the edit modal when clicking Edit", async () => {
            const user = userEvent.setup();

            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            vi.mocked(getTaskById).mockResolvedValue(task);

            renderTaskPage();

            await screen.findByText("Test Task");

            await user.click(
                screen.getByRole("button", {
                    name: /edit/i,
                })
            );

            expect(
                screen.getByText("Edit Task")
            ).toBeInTheDocument();
        });

        it("should close the edit modal", async () => {
            const user = userEvent.setup();

            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            vi.mocked(getTaskById).mockResolvedValue(task);

            renderTaskPage();

            await screen.findByText("Test Task");

            await user.click(
                screen.getByRole("button", {
                    name: /edit/i,
                })
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Cancel",
                })
            );

            expect(
                screen.queryByText("Edit Task")
            ).not.toBeInTheDocument();
        });
    });

    describe("task history", () => {
        it("should display task history when clicking History", async () => {
            const user = userEvent.setup();

            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            vi.mocked(getTaskById).mockResolvedValue(task);

            renderTaskPage();

            await screen.findByText("Test Task");

            await user.click(
                screen.getByRole("button", {
                    name: /history/i,
                })
            );

            expect(
                screen.getByText("Task History")
            ).toBeInTheDocument();
        });

        it("should close task history", async () => {
            const user = userEvent.setup();

            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            vi.mocked(getTaskById).mockResolvedValue(task);

            renderTaskPage();

            await screen.findByText("Test Task");

            await user.click(
                screen.getByRole("button", {
                    name: /history/i,
                })
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Close History",
                })
            );

            expect(
                screen.queryByText("Task History")
            ).not.toBeInTheDocument();
        });
    });

    describe("delete task", () => {
        it("should display the delete confirmation modal", async () => {
            const user = userEvent.setup();

            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            vi.mocked(getTaskById).mockResolvedValue(task);

            renderTaskPage();

            await screen.findByText("Test Task");

            await user.click(
                screen.getByRole("button", {
                    name: /delete/i,
                })
            );

            expect(
                screen.getByText(
                    'Are you sure you want to delete "Test Task"? This action cannot be undone.'
                )
            ).toBeInTheDocument();
        });

        it("should close the delete confirmation modal", async () => {
            const user = userEvent.setup();

            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            vi.mocked(getTaskById).mockResolvedValue(task);

            renderTaskPage();

            await screen.findByText("Test Task");

            await user.click(
                screen.getByRole("button", {
                    name: /delete/i,
                })
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Cancel",
                })
            );

            expect(
                screen.queryByText(
                    'Are you sure you want to delete "Test Task"? This action cannot be undone.'
                )
            ).not.toBeInTheDocument();
        });

        it("should delete the task and navigate to the project page", async () => {
            const user = userEvent.setup();

            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            vi.mocked(getTaskById).mockResolvedValue(task);
            vi.mocked(deleteTask).mockResolvedValue(undefined);

            renderTaskPage();

            await screen.findByText("Test Task");

            await user.click(
                screen.getByRole("button", {
                    name: /delete/i,
                })
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Confirm",
                })
            );

            expect(deleteTask).toHaveBeenCalledWith(
                "task-1",
                "project-1"
            );

            expect(
                await screen.findByText("Projects Page")
            ).toBeInTheDocument();
        });
    });

    describe("authentication errors", () => {
        it("should navigate to login when fetching the task returns 401", async () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            vi.mocked(getTaskById).mockRejectedValue(
                new axios.AxiosError(
                    "Unauthorized",
                    "ERR_BAD_REQUEST",
                    undefined,
                    undefined,
                    {
                        status: 401,
                        statusText: "Unauthorized",
                        headers: {},
                        config: {} as any,
                        data: {},
                    }
                )
            );

            renderTaskPage();

            expect(
                await screen.findByText("Login Page")
            ).toBeInTheDocument();
        });

        it("should navigate to login when deleting the task returns 401", async () => {
            const user = userEvent.setup();

            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            vi.mocked(getTaskById).mockResolvedValue(task);

            vi.mocked(deleteTask).mockRejectedValue(
                new axios.AxiosError(
                    "Unauthorized",
                    "ERR_BAD_REQUEST",
                    undefined,
                    undefined,
                    {
                        status: 401,
                        statusText: "Unauthorized",
                        headers: {},
                        config: {} as any,
                        data: {},
                    }
                )
            );

            renderTaskPage();

            await screen.findByText("Test Task");

            await user.click(
                screen.getByRole("button", {
                    name: /delete/i,
                })
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Confirm",
                })
            );

            expect(
                await screen.findByText("Login Page")
            ).toBeInTheDocument();
        });
    });

    describe("back button", () => {
        it("should navigate back when clicking Back", async () => {
            const user = userEvent.setup();

            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            vi.mocked(getTaskById).mockResolvedValue(task);

            render(
                <MemoryRouter
                    initialEntries={[
                        "/projects/project-1",
                        "/projects/project-1/tasks/task-1",
                    ]}
                    initialIndex={1}
                >
                    <Routes>
                        <Route
                            path="/projects/:projectId/tasks/:taskId"
                            element={<TaskPage />}
                        />
                        <Route
                            path="/projects/:projectId"
                            element={<div>Projects Page</div>}
                        />
                    </Routes>
                </MemoryRouter>
            );

            await screen.findByText("Test Task");

            await user.click(
                screen.getByRole("button", {
                    name: "Back",
                })
            );

            expect(
                await screen.findByText("Projects Page")
            ).toBeInTheDocument();
        });
    });
});