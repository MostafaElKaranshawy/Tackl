import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";

import TaskBoard from "../../../../src/components/tasksComponents/taskBoard/TaskBoard";
import type Task from "../../../../src/types/task";
import { useTaskRefreshContext } from "../../../../src/contexts/TaskRefreshContext/useTaskRefreshContext";

vi.mock(
    "../../../../src/contexts/TaskRefreshContext/useTaskRefreshContext",
    () => ({
        useTaskRefreshContext: vi.fn(),
    })
);

describe("TaskBoard", () => {
    const mockFetchTasks = vi.fn();

    const tasks: Task[] = [
        {
            id: "task-1",
            title: "to do Task",
            description: "to do description",
            status: "to do",
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
        it("should render all task columns", () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            renderTaskBoard();

            expect(screen.getByText("To do")).toBeInTheDocument();
            expect(screen.getByText("In Progress")).toBeInTheDocument();
            expect(screen.getByText("Done")).toBeInTheDocument();
        });

        it("should render tasks in their corresponding columns", () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            renderTaskBoard();

            expect(screen.getByText("to do Task")).toBeInTheDocument();
            expect(screen.getByText("In Progress Task")).toBeInTheDocument();
            expect(screen.getByText("Done Task")).toBeInTheDocument();
        });

        it("should display the correct task counts", () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            renderTaskBoard();

            const counts = screen.getAllByText("1");

            expect(counts).toHaveLength(3);
        });

        it("should call fetchTasks when the component mounts", () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            renderTaskBoard();

            expect(mockFetchTasks).toHaveBeenCalledTimes(1);
        });
    });

    describe("empty columns", () => {
        it("should display No tasks when a column is empty", () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            renderTaskBoard([
                {
                    id: "task-1",
                    title: "to do Task",
                    description: "to do description",
                    status: "to do",
                    priority: "high",
                    estimatedTime: 120,
                    dueDate: null,
                    projectId: "project-1",
                    createdAt: "2026-08-10T10:00:00.000Z",
                    updatedAt: "2026-08-10T10:00:00.000Z",
                },
            ]);

            expect(screen.getAllByText("No tasks")).toHaveLength(2);
        });

        it("should render no tasks in all columns when tasks is empty", () => {
            vi.mocked(useTaskRefreshContext).mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            renderTaskBoard([]);

            expect(screen.getAllByText("No tasks")).toHaveLength(3);
        });
    });

    describe("task refresh", () => {
        it("should call fetchTasks again when refresh key changes", () => {
            const mockContext = vi.mocked(useTaskRefreshContext);

            mockContext.mockReturnValue({
                key: 0,
                setKey: vi.fn(),
            });

            const { rerender } = renderTaskBoard();

            expect(mockFetchTasks).toHaveBeenCalledTimes(1);

            mockContext.mockReturnValue({
                key: 1,
                setKey: vi.fn(),
            });

            rerender(
                <MemoryRouter initialEntries={["/projects/project-1"]}>
                    <Routes>
                        <Route
                            path="/projects/:projectId"
                            element={
                                <TaskBoard
                                    projectId="project-1"
                                    tasks={tasks}
                                    fetchTasks={mockFetchTasks}
                                />
                            }
                        />
                    </Routes>
                </MemoryRouter>
            );

            expect(mockFetchTasks).toHaveBeenCalledTimes(2);
        });
    });
});