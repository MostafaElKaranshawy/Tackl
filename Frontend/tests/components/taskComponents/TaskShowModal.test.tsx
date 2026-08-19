import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";

import TaskShow from "../../../src/components/tasksComponents/TaskShowModal";
import type Task from "../../../src/types/task";

import {
    getTaskById,
    deleteTask,
} from "../../../src/services/taskService";

import { useTaskRefreshContext } from "../../../src/contexts/TaskRefreshContext/useTaskRefreshContext";

vi.mock("../../../src/services/taskService", () => ({
    getTaskById: vi.fn(),
    deleteTask: vi.fn(),
}));


vi.mock(
    "../../../src/contexts/TaskRefreshContext/useTaskRefreshContext",
    () => ({
        useTaskRefreshContext: vi.fn(),
    })
);


vi.mock(
    "../../../src/components/timeEntriesComponents/TimeEntriesList",
    () => ({
        default: ({
            updateTotalTime,
        }: {
            updateTotalTime: (time: number) => void;
        }) => (
            <div data-testid="time-entries-list">
                <span>Time Entries</span>

                <button
                    type="button"
                    onClick={() => updateTotalTime(90)}
                >
                    Set Logged Time
                </button>
            </div>
        ),
    })
);


vi.mock(
    "../../../src/components/tasksComponents/ManageTaskCard",
    () => ({
        default: ({
            onClose,
            onSuccess,
        }: {
            onClose: () => void;
            onSuccess: (task?: Task) => void;
        }) => (
            <div data-testid="manage-task-card">
                <span>Edit Task Modal</span>

                <button
                    type="button"
                    onClick={onClose}
                >
                    Close Edit
                </button>

                <button
                    type="button"
                    onClick={() => onSuccess()}
                >
                    Save Edit
                </button>
            </div>
        ),
    })
);


vi.mock(
    "../../../src/components/generalPurposeComponents/ConfirmationModal",
    () => ({
        default: ({
            title,
            message,
            onConfirm,
            onCancel,
        }: {
            title: string;
            message: string;
            onConfirm: () => void | Promise<void>;
            onCancel: () => void;
            danger?: boolean;
        }) => (
            <div data-testid="confirmation-modal">
                <h2>{title}</h2>

                <p>{message}</p>

                <button
                    type="button"
                    onClick={onConfirm}
                >
                    Confirm
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        ),
    })
);


vi.mock("../../../src/utils/notify", () => ({
    notify: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));


import { notify } from "../../../src/utils/notify";


const task: Task = {
    id: "task-1",
    title: "First Task",
    description: "First task description",
    status: "to do",
    priority: "high",
    estimatedTime: 120,
    dueDate: "2026-08-20",
    projectId: "project-1",
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-02T10:00:00.000Z",
};

const renderTaskShow = (
    taskId = "task-1",
    projectId = "project-1"
) => {
    return render(
        <MemoryRouter
            initialEntries={[
                `/projects/${projectId}?taskId=${taskId}`,
            ]}
        >
            <Routes>
                <Route
                    path="/projects/:projectId"
                    element={<TaskShow />}
                />

                <Route
                    path="/projects/:projectId/tasks/:taskId"
                    element={<div>Task Page</div>}
                />
            </Routes>
        </MemoryRouter>
    );
};


describe("TaskShow", () => {
    beforeEach(() => {
        vi.mocked(useTaskRefreshContext).mockReturnValue({
            key: 0,
            setKey: vi.fn(),
        });

        vi.mocked(getTaskById).mockResolvedValue(task);

        vi.mocked(deleteTask).mockResolvedValue(undefined);
    });


    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("initial rendering", () => {
        it("should render nothing when taskId is missing", () => {
            render(
                <MemoryRouter
                    initialEntries={[
                        "/projects/project-1",
                    ]}
                >
                    <Routes>
                        <Route
                            path="/projects/:projectId"
                            element={<TaskShow />}
                        />
                    </Routes>
                </MemoryRouter>
            );

            expect(
                screen.queryByText("First Task")
            ).not.toBeInTheDocument();

            expect(getTaskById).not.toHaveBeenCalled();
        });


        it("should render nothing when projectId is missing", () => {
            render(
                <MemoryRouter
                    initialEntries={[
                        "/projects?taskId=task-1",
                    ]}
                >
                    <Routes>
                        <Route
                            path="/projects"
                            element={<TaskShow />}
                        />
                    </Routes>
                </MemoryRouter>
            );

            expect(
                screen.queryByText("First Task")
            ).not.toBeInTheDocument();

            expect(getTaskById).not.toHaveBeenCalled();
        });


        it("should fetch the task using taskId and projectId", async () => {
            renderTaskShow();

            await waitFor(() => {
                expect(getTaskById).toHaveBeenCalledWith(
                    "task-1",
                    "project-1"
                );
            });
        });


        it("should render the task after it is loaded", async () => {
            renderTaskShow();

            expect(
                await screen.findByRole("heading", {
                    name: "First Task",
                    level: 1,
                })
            ).toBeInTheDocument();

            expect(
                screen.getByText("First task description")
            ).toBeInTheDocument();
        });


        it("should render the task status", async () => {
            renderTaskShow();

            expect(
                await screen.findByText("To do")
            ).toBeInTheDocument();
        });


        it("should render the task priority", async () => {
            renderTaskShow();

            expect(
                await screen.findByText("high")
            ).toBeInTheDocument();
        });


        it("should render the due date", async () => {
            renderTaskShow();

            await screen.findByRole("heading", {
                name: "First Task",
                level: 1,
            });

            expect(
                screen.getByText(
                    new Date("2026-08-20").toLocaleDateString()
                )
            ).toBeInTheDocument();
        });


        it("should render created and updated dates", async () => {
            renderTaskShow();

            await screen.findByRole("heading", {
                name: "First Task",
                level: 1,
            });

            expect(
                screen.getByText(
                    new Date(
                        task.createdAt
                    ).toLocaleString()
                )
            ).toBeInTheDocument();

            expect(
                screen.getByText(
                    new Date(
                        task.updatedAt
                    ).toLocaleString()
                )
            ).toBeInTheDocument();
        });


        it("should render the TimeEntriesList", async () => {
            renderTaskShow();

            await screen.findByRole("heading", {
                name: "First Task",
                level: 1,
            });

            expect(
                screen.getByTestId("time-entries-list")
            ).toBeInTheDocument();
        });
    });

    describe("loading errors", () => {
        it("should close the task window when getTaskById fails", async () => {
            vi.mocked(getTaskById).mockRejectedValueOnce(
                new Error("Failed to load task")
            );

            renderTaskShow();

            await waitFor(() => {
                expect(
                    screen.queryByText("First Task")
                ).not.toBeInTheDocument();
            });
        });
    });

    describe("edit task", () => {
        it("should open the edit modal", async () => {
            renderTaskShow();

            await screen.findByRole("heading", {
                name: "First Task",
                level: 1,
            });

            const editButton = screen.getByTitle(
                "Edit Task"
            );

            fireEvent.click(editButton);

            expect(
                screen.getByTestId("manage-task-card")
            ).toBeInTheDocument();

            expect(
                screen.getByText("Edit Task Modal")
            ).toBeInTheDocument();
        });


        it("should close the edit modal", async () => {
            renderTaskShow();

            await screen.findByRole("heading", {
                name: "First Task",
                level: 1,
            });

            fireEvent.click(
                screen.getByTitle("Edit Task")
            );

            expect(
                screen.getByTestId("manage-task-card")
            ).toBeInTheDocument();

            fireEvent.click(
                screen.getByRole("button", {
                    name: "Close Edit",
                })
            );

            expect(
                screen.queryByTestId("manage-task-card")
            ).not.toBeInTheDocument();
        });


        it("should refresh the task after editing", async () => {
            const setKey = vi.fn();

            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey,
            });

            renderTaskShow();

            await screen.findByRole("heading", {
                name: "First Task",
                level: 1,
            });

            fireEvent.click(
                screen.getByTitle("Edit Task")
            );

            fireEvent.click(
                screen.getByRole("button", {
                    name: "Save Edit",
                })
            );

            expect(setKey).toHaveBeenCalledTimes(1);

            expect(
                screen.queryByTestId("manage-task-card")
            ).not.toBeInTheDocument();
        });
    });

    describe("delete task", () => {
        it("should open the delete confirmation modal", async () => {
            renderTaskShow();

            await screen.findByRole("heading", {
                name: "First Task",
                level: 1,
            });

            fireEvent.click(
                screen.getByTitle("Delete Task")
            );

            expect(
                screen.getByTestId("confirmation-modal")
            ).toBeInTheDocument();

            expect(
                screen.getByText(
                    'Are you sure you want to delete "First Task"? This action cannot be undone.'
                )
            ).toBeInTheDocument();
        });


        it("should close the delete confirmation modal when cancelled", async () => {
            renderTaskShow();

            await screen.findByRole("heading", {
                name: "First Task",
                level: 1,
            });

            fireEvent.click(
                screen.getByTitle("Delete Task")
            );

            expect(
                screen.getByTestId("confirmation-modal")
            ).toBeInTheDocument();

            fireEvent.click(
                screen.getByRole("button", {
                    name: "Cancel",
                })
            );

            expect(
                screen.queryByTestId("confirmation-modal")
            ).not.toBeInTheDocument();
        });


        it("should delete the task when confirmed", async () => {
            const setKey = vi.fn();

            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey,
            });

            renderTaskShow();

            await screen.findByRole("heading", {
                name: "First Task",
                level: 1,
            });

            fireEvent.click(
                screen.getByTitle("Delete Task")
            );

            fireEvent.click(
                screen.getByRole("button", {
                    name: "Confirm",
                })
            );

            await waitFor(() => {
                expect(deleteTask).toHaveBeenCalledWith(
                    "task-1",
                    "project-1"
                );
            });

            expect(setKey).toHaveBeenCalledTimes(1);

            expect(
                screen.queryByText("First Task")
            ).not.toBeInTheDocument();
        });


        it("should show an error when deleting the task fails", async () => {
            vi.mocked(deleteTask).mockRejectedValueOnce(
                new Error("Delete failed")
            );

            renderTaskShow();

            await screen.findByRole("heading", {
                name: "First Task",
                level: 1,
            });

            fireEvent.click(
                screen.getByTitle("Delete Task")
            );

            fireEvent.click(
                screen.getByRole("button", {
                    name: "Confirm",
                })
            );

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "Failed to delete task."
                );
            });
        });
    });

    describe("refresh context", () => {
        it("should reload the task when the refresh key changes", async () => {
            const setKey = vi.fn();

            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey,
            });

            renderTaskShow();

            await screen.findByRole("heading", {
                name: "First Task",
                level: 1,
            });

            expect(getTaskById).toHaveBeenCalledTimes(1);
        });
    });

    describe("optional task data", () => {
        it("should show fallback when description is missing", async () => {
            vi.mocked(getTaskById).mockResolvedValueOnce({
                ...task,
                description: "",
            });

            renderTaskShow();

            await screen.findByRole("heading", {
                name: "First Task",
                level: 1,
            });

            expect(
                screen.getByText("No description provided.")
            ).toBeInTheDocument();
        });


        it("should show N/A when due date is missing", async () => {
            vi.mocked(getTaskById).mockResolvedValueOnce({
                ...task,
                dueDate: null,
            });

            renderTaskShow();

            await screen.findByRole("heading", {
                name: "First Task",
                level: 1,
            });

            expect(
                screen.getByText("N/A")
            ).toBeInTheDocument();
        });


        it("should show N/A when estimated time is missing", async () => {
            vi.mocked(getTaskById).mockResolvedValueOnce({
                ...task,
                estimatedTime: 0,
            });

            renderTaskShow();

            await screen.findByRole("heading", {
                name: "First Task",
                level: 1,
            });

            expect(
                screen.getByText("N/A")
            ).toBeInTheDocument();
        });
    });

    describe("status rendering", () => {
        it("should render In Progress status", async () => {
            vi.mocked(getTaskById).mockResolvedValueOnce({
                ...task,
                status: "in_progress",
            });

            renderTaskShow();

            expect(
                await screen.findByText("In progress")
            ).toBeInTheDocument();
        });


        it("should render Done status", async () => {
            vi.mocked(getTaskById).mockResolvedValueOnce({
                ...task,
                status: "done",
            });

            renderTaskShow();

            expect(
                await screen.findByText("Done")
            ).toBeInTheDocument();
        });
    });

    describe("priority rendering", () => {
        it("should render medium priority", async () => {
            vi.mocked(getTaskById).mockResolvedValueOnce({
                ...task,
                priority: "medium",
            });

            renderTaskShow();

            expect(
                await screen.findByText("medium")
            ).toBeInTheDocument();
        });


        it("should render low priority", async () => {
            vi.mocked(getTaskById).mockResolvedValueOnce({
                ...task,
                priority: "low",
            });

            renderTaskShow();

            expect(
                await screen.findByText("low")
            ).toBeInTheDocument();
        });
    });
});