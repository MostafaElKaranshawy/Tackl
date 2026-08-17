import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import TasksList from "../../../src/components/tasksComponents/TasksList";
import type Task from "../../../src/types/task";

import { useTaskRefreshContext } from "../../../src/contexts/TaskRefreshContext/useTaskRefreshContext";

vi.mock(
    "../../../src/contexts/TaskRefreshContext/useTaskRefreshContext",
    () => ({
        useTaskRefreshContext: vi.fn(),
    })
);

describe("TasksList", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    const tasks: Task[] = [
        {
            id: "task-1",
            title: "First Task",
            description: "First task description",
            status: "todo",
            priority: "high",
            estimatedTime: 120,
            dueDate: "2026-08-20",
            projectId: "project-1",
            createdAt: "2026-08-01T10:00:00.000Z",
            updatedAt: "2026-08-02T10:00:00.000Z",
        },
        {
            id: "task-2",
            title: "Second Task",
            description: "Second task description",
            status: "in_progress",
            priority: "medium",
            estimatedTime: 60,
            dueDate: "2026-08-25",
            projectId: "project-1",
            createdAt: "2026-08-03T10:00:00.000Z",
            updatedAt: "2026-08-04T10:00:00.000Z",
        },
    ];

    const renderTasksList = (
        taskList: Task[] = tasks,
        refresh = vi.fn()
    ) => {
        return render(
            <MemoryRouter
                initialEntries={[
                    "/projects/project-1?status=todo&taskId=old-task",
                ]}
            >
                <Routes>
                    <Route
                        path="/projects/:projectId"
                        element={
                            <TasksList
                                tasks={taskList}
                                refresh={refresh}
                            />
                        }
                    />

                    <Route
                        path="/projects/:projectId/tasks/:taskId"
                        element={<div>Task Page</div>}
                    />
                </Routes>
            </MemoryRouter>
        );
    };

    describe("initial state", () => {
        it("should render all tasks", () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
            } as ReturnType<typeof useTaskRefreshContext>);

            renderTasksList();

            expect(screen.getByText("First Task")).toBeInTheDocument();
            expect(screen.getByText("Second Task")).toBeInTheDocument();
        });

        it("should render an empty list when there are no tasks", () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
            } as ReturnType<typeof useTaskRefreshContext>);

            renderTasksList([]);

            expect(screen.queryByText("First Task")).not.toBeInTheDocument();
            expect(screen.queryByText("Second Task")).not.toBeInTheDocument();
        });
    });

    describe("refresh", () => {
        it("should call refresh when the component mounts", () => {
            const refresh = vi.fn();

            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
            } as ReturnType<typeof useTaskRefreshContext>);

            renderTasksList(tasks, refresh);

            expect(refresh).toHaveBeenCalledTimes(1);
        });

        it("should call refresh when the context key changes", () => {
            const refresh = vi.fn();

            vi.mocked(useTaskRefreshContext)
                .mockReturnValueOnce({
                    key: 0,
                } as ReturnType<typeof useTaskRefreshContext>)
                .mockReturnValueOnce({
                    key: 1,
                } as ReturnType<typeof useTaskRefreshContext>);

            const { rerender } = renderTasksList(tasks, refresh);

            expect(refresh).toHaveBeenCalledTimes(1);

            rerender(
                <MemoryRouter
                    initialEntries={[
                        "/projects/project-1?status=todo&taskId=old-task",
                    ]}
                >
                    <Routes>
                        <Route
                            path="/projects/:projectId"
                            element={
                                <TasksList
                                    tasks={tasks}
                                    refresh={refresh}
                                />
                            }
                        />
                    </Routes>
                </MemoryRouter>
            );

            expect(refresh).toHaveBeenCalledTimes(2);
        });
    });

    describe("task data", () => {
        it("should render the correct number of task cards", () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
            } as ReturnType<typeof useTaskRefreshContext>);

            renderTasksList();

            expect(screen.getByText("First Task")).toBeInTheDocument();
            expect(screen.getByText("Second Task")).toBeInTheDocument();
        });

        it("should render no task cards when tasks is empty", () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
            } as ReturnType<typeof useTaskRefreshContext>);

            renderTasksList([]);

            expect(screen.queryByText("First Task")).not.toBeInTheDocument();
            expect(screen.queryByText("Second Task")).not.toBeInTheDocument();
        });
    });
});