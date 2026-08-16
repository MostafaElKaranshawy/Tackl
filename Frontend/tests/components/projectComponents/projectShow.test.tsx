import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

import ProjectShow from "../../../src/components/projectComponents/ProjectShow";
import type Project from "../../../src/types/project";
import type Task from "../../../src/types/task";

import { getProjectTasks } from "../../../src/services/taskService";
import { deleteProject } from "../../../src/services/projectService";
import { notify } from "../../../src/utils/notify";

vi.mock("../../../src/services/taskService", () => ({
    getProjectTasks: vi.fn(),
    deleteTask: vi.fn(),
}));

vi.mock("../../../src/services/projectService", () => ({
    deleteProject: vi.fn(),
}));

vi.mock("../../../src/utils/notify", () => ({
    notify: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

vi.mock(
    "../../../src/components/projectComponents/ManageProjectCard",
    () => ({
        default: ({
            onClose,
            onSuccess,
        }: {
            onClose: () => void;
            onSuccess: (project?: Project) => void;
        }) => (
            <div data-testid="manage-project-card">
                <button onClick={onClose}>Close Edit Project</button>
                <button
                    onClick={() =>
                        onSuccess({
                            ...project,
                            name: "Updated Project",
                        })
                    }
                >
                    Save Project
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
            onConfirm: () => void;
            onCancel: () => void;
        }) => (
            <div data-testid="confirmation-modal">
                <h2>{title}</h2>
                <p>{message}</p>

                <button onClick={onConfirm}>
                    Confirm
                </button>

                <button onClick={onCancel}>
                    Cancel
                </button>
            </div>
        ),
    })
);

vi.mock(
    "../../../src/components/tasksComponents/ManageTaskCard",
    () => ({
        default: ({
            mode,
            onClose,
            onSuccess,
        }: {
            mode: string;
            onClose: () => void;
            onSuccess: () => void;
        }) => (
            <div data-testid="manage-task-card">
                <span>{mode === "create" ? "Create Task" : "Edit Task"}</span>

                <button onClick={onClose}>
                    Close Task
                </button>

                <button onClick={onSuccess}>
                    Save Task
                </button>
            </div>
        ),
    })
);

vi.mock(
    "../../../src/components/tasksComponents/TasksList",
    () => ({
        default: ({
            tasks,
            refresh,
        }: {
            tasks: Task[];
            refresh: () => void;
        }) => (
            <div data-testid="tasks-list">
                {tasks.map((task) => (
                    <div key={task.id}>
                        <span>{task.title}</span>

                        <button onClick={refresh}>
                            Refresh Tasks
                        </button>
                    </div>
                ))}
            </div>
        ),
    })
);

vi.mock(
    "../../../src/components/tasksComponents/taskBoard/TaskBoard",
    () => ({
        default: ({
            tasks,
            fetchTasks,
        }: {
            tasks: Task[];
            fetchTasks: () => void;
        }) => (
            <div data-testid="task-board">
                <span>Task Board</span>

                {tasks.map((task) => (
                    <span key={task.id}>
                        {task.title}
                    </span>
                ))}

                <button onClick={fetchTasks}>
                    Fetch Board Tasks
                </button>
            </div>
        ),
    })
);

vi.mock(
    "../../../src/components/projectsComponents/SortByComponent",
    () => ({
        default: ({
            attributesList,
            sortBy,
            setSortBy,
            sortOrder,
            setSortOrder,
        }: {
            attributesList: string[];
            sortBy: string;
            setSortBy: (value: string) => void;
            sortOrder: string;
            setSortOrder: (value: string) => void;
        }) => (
            <div data-testid="sort-by-component">
                <span>{sortBy}</span>
                <span>{sortOrder}</span>

                {attributesList.map((attribute) => (
                    <button
                        key={attribute}
                        onClick={() => setSortBy(attribute)}
                    >
                        Sort {attribute}
                    </button>
                ))}

                <button onClick={() => setSortOrder("desc")}>
                    Descending
                </button>
            </div>
        ),
    })
);

vi.mock(
    "../../../src/components/projectsComponents/ProjectsFilterMenu",
    () => ({
        default: ({
            filter,
            setFilter,
            onConfirm,
        }: {
            filter: {
                status: string;
                priority: string;
                overdue: boolean;
            };
            setFilter: React.Dispatch<
                React.SetStateAction<{
                    status: string;
                    priority: string;
                    overdue: boolean;
                }>
            >;
            onConfirm: () => void;
        }) => (
            <div data-testid="filter-menu">
                <span>{filter.status}</span>
                <span>{filter.priority}</span>

                <button
                    onClick={() =>
                        setFilter({
                            status: "done",
                            priority: "high",
                            overdue: true,
                        })
                    }
                >
                    Apply Test Filter
                </button>

                <button onClick={onConfirm}>
                    Confirm Filter
                </button>
            </div>
        ),
    })
);

const project: Project = {
    id: "project-1",
    name: "Test Project",
    description: "Test project description",
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-02T10:00:00.000Z",
};

const tasks: Task[] = [
    {
        id: "task-1",
        title: "First Task",
        description: "First task description",
        status: "to do",
        priority: "high",
        estimatedTime: 120,
        dueDate: "2026-08-20",
        projectId: "project-1",
        createdAt: "2026-08-10T10:00:00.000Z",
        updatedAt: "2026-08-10T10:00:00.000Z",
    },
    {
        id: "task-2",
        title: "Second Task",
        description: "Second task description",
        status: "done",
        priority: "medium",
        estimatedTime: 60,
        dueDate: "2026-08-25",
        projectId: "project-1",
        createdAt: "2026-08-11T10:00:00.000Z",
        updatedAt: "2026-08-11T10:00:00.000Z",
    },
];

const renderProjectShow = (
    currentProject: Project = project,
    deleteRefresh = vi.fn(),
    onUpdated = vi.fn()
) => {
    return render(
        <MemoryRouter initialEntries={["/projects/project-1"]}>
            <ProjectShow
                project={currentProject}
                deleteRefresh={deleteRefresh}
                onUpdated={onUpdated}
            />
        </MemoryRouter>
    );
};
beforeEach(() => {
    vi.mocked(getProjectTasks).mockResolvedValue({
        tasks,
        total: tasks.length,
    });

    vi.mocked(deleteProject).mockResolvedValue(undefined);

    vi.clearAllMocks();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe("initial rendering", () => {
    it("should render project dates", () => {
        renderProjectShow();

        expect(
            screen.getByText(
                new Date(project.createdAt).toLocaleString()
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                new Date(project.updatedAt).toLocaleString()
            )
        ).toBeInTheDocument();
    });

    it("should render the Tasks section", () => {
        renderProjectShow();

        expect(
            screen.getByText("Tasks")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /list/i })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /board/i })
        ).toBeInTheDocument();
    });
});

describe("task fetching", () => {
    it("should fetch tasks when the component mounts", async () => {
        renderProjectShow();

        await waitFor(() => {
            expect(getProjectTasks).toHaveBeenCalledTimes(1);
        });

        expect(getProjectTasks).toHaveBeenCalledWith(
            "project-1",
            expect.objectContaining({
                page: 1,
                pageSize: expect.any(Number),
                sortBy: "createdAt",
                sortOrder: "asc",
                search: "",
                status: "",
                priority: "",
                overdue: false,
            })
        );
    });

    it("should render fetched tasks", async () => {
        renderProjectShow();

        expect(
            await screen.findByText("First Task")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Second Task")
        ).toBeInTheDocument();
    });

    it("should display empty state when there are no tasks", async () => {
        vi.mocked(getProjectTasks).mockResolvedValue({
            tasks: [],
            total: 0,
        });

        renderProjectShow();

        expect(
            await screen.findByText("No tasks yet")
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "Tasks for this project will appear here. You'll be able to create, assign, prioritize, and track progress."
            )
        ).toBeInTheDocument();
    });

    it("should show an error notification when fetching tasks fails", async () => {
        vi.mocked(getProjectTasks).mockRejectedValue(
            new Error("Fetch failed")
        );

        renderProjectShow();

        await waitFor(() => {
            expect(notify.error).toHaveBeenCalledWith(
                "Failed to fetch tasks. Please try again later."
            );
        });
    });
});

describe("task view", () => {

    // it("should switch to board view", async () => {
    //     const user = userEvent.setup();

    //     renderProjectShow();

    //     await screen.findByText("First Task");

    //     await user.click(
    //         screen.getByRole("button", { name: /board/i })
    //     );

    //     expect(
    //         screen.getByTestId("task-board")
    //     ).toBeInTheDocument();

    //     expect(
    //         screen.queryByTestId("tasks-list")
    //     ).not.toBeInTheDocument();
    // });

    it("should switch back to list view", async () => {
        const user = userEvent.setup();

        renderProjectShow();

        await user.click(
            screen.getByRole("button", { name: /board/i })
        );

        await user.click(
            screen.getByRole("button", { name: /list/i })
        );

        expect(
            screen.getByTestId("tasks-list")
        ).toBeInTheDocument();

        expect(
            screen.queryByTestId("task-board")
        ).not.toBeInTheDocument();
    });
});

describe("search", () => {
    it("should update search and fetch tasks again", async () => {
        const user = userEvent.setup();

        renderProjectShow();

        await waitFor(() => {
            expect(getProjectTasks).toHaveBeenCalledTimes(1);
        });

        const searchInput = screen.getByPlaceholderText("Search...");

        await user.type(searchInput, "First");

        await waitFor(() => {
            expect(getProjectTasks).toHaveBeenCalledWith(
                "project-1",
                expect.objectContaining({
                    search: "first",
                })
            );
        });
    });
});


describe("add task", () => {
    it("should open ManageTaskCard in create mode", async () => {
        const user = userEvent.setup();

        renderProjectShow();

        await user.click(
            screen.getByRole("button", {
                name: "+ Add Task",
            })
        );

        expect(
            screen.getByTestId("manage-task-card")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Create Task")
        ).toBeInTheDocument();
    });

    it("should close the create task modal", async () => {
        const user = userEvent.setup();

        renderProjectShow();

        await user.click(
            screen.getByRole("button", {
                name: "+ Add Task",
            })
        );

        await user.click(
            screen.getByRole("button", {
                name: "Close Task",
            })
        );

        expect(
            screen.queryByTestId("manage-task-card")
        ).not.toBeInTheDocument();
    });

    it("should fetch tasks after creating a task", async () => {
        const user = userEvent.setup();

        renderProjectShow();

        await waitFor(() => {
            expect(getProjectTasks).toHaveBeenCalledTimes(1);
        });

        await user.click(
            screen.getByRole("button", {
                name: "+ Add Task",
            })
        );

        await user.click(
            screen.getByRole("button", {
                name: "Save Task",
            })
        );

        await waitFor(() => {
            expect(getProjectTasks).toHaveBeenCalledTimes(2);
        });
    });
});

describe("edit project", () => {
    it("should open the edit project modal", async () => {
        const user = userEvent.setup();

        renderProjectShow();

        const editIcon =
            document.querySelector(".project-tools svg");

        expect(editIcon).not.toBeNull();

        await user.click(editIcon!);

        expect(
            screen.getByTestId("manage-project-card")
        ).toBeInTheDocument();
    });

    it("should close the edit project modal", async () => {
        const user = userEvent.setup();

        renderProjectShow();

        await user.click(
            document.querySelector(".project-tools svg")!
        );

        await user.click(
            screen.getByRole("button", {
                name: "Close Edit Project",
            })
        );

        expect(
            screen.queryByTestId("manage-project-card")
        ).not.toBeInTheDocument();
    });

    it("should call onUpdated after editing the project", async () => {
        const user = userEvent.setup();
        const onUpdated = vi.fn();

        renderProjectShow(
            project,
            vi.fn(),
            onUpdated
        );

        await user.click(
            document.querySelector(".project-tools svg")!
        );

        await user.click(
            screen.getByRole("button", {
                name: "Save Project",
            })
        );

        expect(onUpdated).toHaveBeenCalledWith(
            expect.objectContaining({
                id: "project-1",
                name: "Updated Project",
            })
        );
    });
});

describe("delete project", () => {
    it("should open delete confirmation", async () => {
        const user = userEvent.setup();

        renderProjectShow();

        const deleteIcon =
            document.querySelectorAll(".project-tools svg")[1];

        expect(deleteIcon).not.toBeNull();

        await user.click(deleteIcon);

        expect(
            screen.getByTestId("confirmation-modal")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Delete Project")
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                /Are you sure you want to delete the project "Test Project"/
            )
        ).toBeInTheDocument();
    });

    it("should close delete confirmation when cancelled", async () => {
        const user = userEvent.setup();

        renderProjectShow();

        await user.click(
            document.querySelectorAll(".project-tools svg")[1]
        );

        await user.click(
            screen.getByRole("button", {
                name: "Cancel",
            })
        );

        expect(
            screen.queryByTestId("confirmation-modal")
        ).not.toBeInTheDocument();
    });

    it("should delete the project when confirmed", async () => {
        const user = userEvent.setup();
        const deleteRefresh = vi.fn();

        renderProjectShow(
            project,
            deleteRefresh
        );

        await user.click(
            document.querySelectorAll(".project-tools svg")[1]
        );

        await user.click(
            screen.getByRole("button", {
                name: "Confirm",
            })
        );

        await waitFor(() => {
            expect(deleteProject).toHaveBeenCalledWith(
                "project-1"
            );
        });

        expect(deleteRefresh).toHaveBeenCalledTimes(1);
    });

    it("should show an error when project deletion fails", async () => {
        const user = userEvent.setup();

        vi.mocked(deleteProject).mockRejectedValue(
            new Error("Delete failed")
        );

        renderProjectShow();

        await user.click(
            document.querySelectorAll(".project-tools svg")[1]
        );

        await user.click(
            screen.getByRole("button", {
                name: "Confirm",
            })
        );

        await waitFor(() => {
            expect(notify.error).toHaveBeenCalledWith(
                "Failed to delete project. Please try again later."
            );
        });
    });
});

describe("pagination", () => {
    it("should display the task range", async () => {
        renderProjectShow();

        await waitFor(() => {
            expect(
                screen.getByText(/1 - 2 of 2/)
            ).toBeInTheDocument();
        });
    });

    it("should not move to the next page when all tasks fit on the current page", async () => {
        const user = userEvent.setup();

        renderProjectShow();

        const rightArrow =
            document.querySelector(".pagination svg:last-child");

        expect(rightArrow).not.toBeNull();

        await user.click(rightArrow!);

        expect(getProjectTasks).toHaveBeenCalledTimes(1);
    });
});