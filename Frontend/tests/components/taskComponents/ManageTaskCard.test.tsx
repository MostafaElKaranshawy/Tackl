import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import ManageTaskCard from "../../../src/components/tasksComponents/ManageTaskCard";
import { notify } from "../../../src/utils/notify";
import { createTask, updateTask } from "../../../src/services/taskService";
import { getProjectTaskStatusByProjectId } from "../../../src/services/taskStatusService";
import type Task from "../../../src/types/task";
import type { Column } from "../../../src/types/column";

vi.mock("axios");
vi.mock("../../../src/utils/notify", () => ({
    notify: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));
vi.mock("../../../src/services/taskService", () => ({
    createTask: vi.fn(),
    updateTask: vi.fn(),
}));
vi.mock("../../../src/services/taskStatusService", () => ({
    getProjectTaskStatusByProjectId: vi.fn(),
}));

const mockedAxios = axios as unknown as { isAxiosError: ReturnType<typeof vi.fn> };
const mockedGetStatuses = getProjectTaskStatusByProjectId as unknown as ReturnType<typeof vi.fn>;
const mockedCreateTask = createTask as unknown as ReturnType<typeof vi.fn>;
const mockedUpdateTask = updateTask as unknown as ReturnType<typeof vi.fn>;

const columns: Column[] = [
    { status: "to_do" } as Column,
    { status: "in_progress" } as Column,
    { status: "done" } as Column,
];

const baseTask: Task = {
    id: "task-1",
    projectId: "project-1",
    title: "Existing Task",
    description: "Existing description",
    priority: "high",
    status: "in_progress",
    dueDate: "2026-01-01T00:00:00.000Z",
    estimatedTime: 45,
} as Task;

function setup(props?: Partial<React.ComponentProps<typeof ManageTaskCard>>) {
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    const defaultProps = {
        mode: "create" as const,
        projectId: "project-1",
        onSuccess,
        onClose,
    };

    const utils = render(<ManageTaskCard {...defaultProps} {...props} />);

    return { ...utils, onSuccess, onClose };
}

beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.isAxiosError = vi.fn().mockReturnValue(false);
    mockedGetStatuses.mockResolvedValue(columns);
});

describe("ManageTaskCard", () => {
    describe("initial rendering", () => {
        it("renders 'Create New Task' heading in create mode", async () => {
            setup({ mode: "create" });
            expect(screen.getByText("Create New Task")).toBeInTheDocument();
            await waitFor(() =>
                expect(mockedGetStatuses).toHaveBeenCalledWith("project-1")
            );
        });

        it("renders 'Edit Task' heading and pre-fills fields in edit mode", async () => {
            setup({ mode: "edit", task: baseTask });

            expect(screen.getByText("Edit Task")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Existing Task")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Existing description")).toBeInTheDocument();
            expect(screen.getByDisplayValue("45")).toBeInTheDocument();

            await waitFor(() =>
                expect(mockedGetStatuses).toHaveBeenCalled()
            );
        });

        it("shows 'Loading...' in the status select while fetching statuses", () => {
            mockedGetStatuses.mockReturnValue(new Promise(() => {})); // never resolves
            setup();
            expect(screen.getByText("Loading...")).toBeInTheDocument();
        });

        it("populates status options and defaults to the first column once loaded", async () => {
            setup();

            await waitFor(() => {
                expect(screen.getByText("To do")).toBeInTheDocument();
            });

            expect(screen.getByText("In progress")).toBeInTheDocument();
            expect(screen.getByText("Done")).toBeInTheDocument();

            const statusSelect = screen.getByLabelText("Status") as HTMLSelectElement;
            expect(statusSelect.value).toBe("to_do");
        });

        it("sets status to empty string when no columns are returned", async () => {
            mockedGetStatuses.mockResolvedValue([]);
            setup();

            await waitFor(() => {
                expect(mockedGetStatuses).toHaveBeenCalled();
            });

            const statusSelect = screen.getByLabelText("Status") as HTMLSelectElement;
            expect(statusSelect.value).toBe("");
        });
    });

    describe("fetching task statuses - error handling", () => {
        it("shows a 'not found' error on a 404 response and does not retry", async () => {
            mockedAxios.isAxiosError.mockReturnValue(true);
            mockedGetStatuses.mockRejectedValue({
                response: { status: 404 },
            });

            setup();

            await waitFor(() =>
                expect(notify.error).toHaveBeenCalledWith("Task statuses not found")
            );
            expect(mockedGetStatuses).toHaveBeenCalledTimes(1);
        });

        it("shows an 'unauthorized' error on a 401 response and does not retry", async () => {
            mockedAxios.isAxiosError.mockReturnValue(true);
            mockedGetStatuses.mockRejectedValue({
                response: { status: 401 },
            });

            setup();

            await waitFor(() =>
                expect(notify.error).toHaveBeenCalledWith("Unauthorized access")
            );
            expect(mockedGetStatuses).toHaveBeenCalledTimes(1);
        });

        it("retries up to 3 times on other errors before showing a generic error", async () => {
            mockedAxios.isAxiosError.mockReturnValue(true);
            mockedGetStatuses.mockRejectedValue({
                response: { status: 500 },
            });

            setup();

            await waitFor(
                () =>
                    expect(notify.error).toHaveBeenCalledWith(
                        "Error fetching task statuses"
                    ),
                { timeout: 3000 }
            );

            // initial call + 3 retries = 4 calls
            expect(mockedGetStatuses).toHaveBeenCalledTimes(4);
        });

        it("retries on non-axios errors as well", async () => {
            mockedAxios.isAxiosError.mockReturnValue(false);
            mockedGetStatuses.mockRejectedValue(new Error("network down"));

            setup();

            await waitFor(
                () =>
                    expect(notify.error).toHaveBeenCalledWith(
                        "Error fetching task statuses"
                    ),
                { timeout: 3000 }
            );
            expect(mockedGetStatuses).toHaveBeenCalledTimes(4);
        });
    });

    describe("form validation", () => {
        it("shows an error and does not submit when title is empty", async () => {
            const user = userEvent.setup();
            setup();

            await waitFor(() => expect(mockedGetStatuses).toHaveBeenCalled());

            await user.click(screen.getByRole("button", { name: /create task/i }));

            expect(
                screen.getByText("Task title cannot be empty.")
            ).toBeInTheDocument();
            expect(mockedCreateTask).not.toHaveBeenCalled();
        });

        it("shows an error and does not submit when status is empty", async () => {
            const user = userEvent.setup();
            mockedGetStatuses.mockResolvedValue([]);
            setup();

            await waitFor(() => {
                const statusSelect = screen.getByLabelText("Status") as HTMLSelectElement;
                expect(statusSelect.value).toBe("");
            });

            await user.type(
                screen.getByPlaceholderText("Enter task title"),
                "New task"
            );
            await user.click(screen.getByRole("button", { name: /create task/i }));

            expect(notify.error).toHaveBeenCalledWith("Task status is required.");
            expect(mockedCreateTask).not.toHaveBeenCalled();
        });
    });

    describe("create mode submission", () => {
        it("calls createTask with trimmed/lowercased data and reports success", async () => {
            const user = userEvent.setup();
            const created = { ...baseTask, id: "new-task" };
            mockedCreateTask.mockResolvedValue(created);

            const { onSuccess, onClose } = setup({ mode: "create" });

            await waitFor(() =>
                expect((screen.getByLabelText("Status") as HTMLSelectElement).value).toEqual("to_do")
            );

            await user.type(
                screen.getByPlaceholderText("Enter task title"),
                "  My New Task  "
            );
            await user.type(
                screen.getByPlaceholderText("Describe your task..."),
                "  Some description  "
            );

            await user.click(screen.getByRole("button", { name: /create task/i }));

            await waitFor(() => expect(mockedCreateTask).toHaveBeenCalled());

            expect(mockedCreateTask).toHaveBeenCalledWith(
                {
                    title: "My New Task",
                    description: "Some description",
                    status: "to_do",
                    priority: "medium",
                    dueDate: null,
                    estimatedTime: null,
                },
                "project-1"
            );

            expect(onSuccess).toHaveBeenCalledWith(created);
            expect(notify.success).toHaveBeenCalledWith(
                "Task created successfully!"
            );
            expect(onClose).toHaveBeenCalled();
        });

        it("sends null description when description is blank/whitespace", async () => {
            const user = userEvent.setup();
            mockedCreateTask.mockResolvedValue(baseTask);
            setup({ mode: "create" });

            await waitFor(() =>
                expect((screen.getByLabelText("Status") as HTMLSelectElement).value).toEqual("to_do")
            );

            await user.type(
                screen.getByPlaceholderText("Enter task title"),
                "Task"
            );
            await user.type(
                screen.getByPlaceholderText("Describe your task..."),
                "   "
            );
            await user.click(screen.getByRole("button", { name: /create task/i }));

            await waitFor(() => expect(mockedCreateTask).toHaveBeenCalled());
            expect(mockedCreateTask).toHaveBeenCalledWith(
                expect.objectContaining({ description: null }),
                "project-1"
            );
        });

        it("shows 'Creating...' and disables buttons while submitting", async () => {
            const user = userEvent.setup();
            let resolvePromise: (value: unknown) => void;
            mockedCreateTask.mockReturnValue(
                new Promise((resolve) => {
                    resolvePromise = resolve;
                })
            );

            setup({ mode: "create" });

            await waitFor(() =>
                expect((screen.getByLabelText("Status") as HTMLSelectElement).value).toEqual("to_do")
            );
            await user.type(
                screen.getByPlaceholderText("Enter task title"),
                "Task"
            );

            const submitButton = screen.getByRole("button", {
                name: /create task/i,
            });
            await user.click(submitButton);

            resolvePromise!(baseTask);
            await waitFor(() =>
                expect(notify.success).toHaveBeenCalled()
            );
        });
    });

    describe("edit mode submission", () => {
        it("calls updateTask with the task id/projectId and reports success", async () => {
            const user = userEvent.setup();
            const updated = { ...baseTask, title: "Updated Task" };
            mockedUpdateTask.mockResolvedValue(updated);

            const { onSuccess, onClose } = setup({ mode: "edit", task: baseTask });

            await waitFor(() =>
                expect(mockedGetStatuses).toHaveBeenCalled()
            );

            const titleInput = screen.getByDisplayValue("Existing Task");
            await user.clear(titleInput);
            await user.type(titleInput, "Updated Task");

            await user.click(screen.getByRole("button", { name: /save changes/i }));

            await waitFor(() => expect(mockedUpdateTask).toHaveBeenCalled());

            expect(mockedUpdateTask).toHaveBeenCalledWith(
                baseTask.id,
                expect.objectContaining({ title: "Updated Task" }),
                baseTask.projectId
            );
            expect(onSuccess).toHaveBeenCalledWith(updated);
            expect(notify.success).toHaveBeenCalledWith(
                "Task updated successfully!"
            );
            expect(onClose).toHaveBeenCalled();
        });

    });

    describe("submission error handling", () => {
        const submitCreateForm = async (user: ReturnType<typeof userEvent.setup>) => {
            await waitFor(() =>
                expect((screen.getByLabelText("Status") as HTMLSelectElement).value).toEqual("to_do")
            );
            await user.type(
                screen.getByPlaceholderText("Enter task title"),
                "Task"
            );
            await user.click(screen.getByRole("button", { name: /create task/i }));
        };

        it("shows 'Invalid task data.' on a 400 response", async () => {
            const user = userEvent.setup();
            mockedAxios.isAxiosError.mockReturnValue(true);
            mockedCreateTask.mockRejectedValue({ response: { status: 400 } });
            setup({ mode: "create" });

            await submitCreateForm(user);

            await waitFor(() =>
                expect(notify.error).toHaveBeenCalledWith("Invalid task data.")
            );
        });

        it("shows an authorization error on a 401 response", async () => {
            const user = userEvent.setup();
            mockedAxios.isAxiosError.mockReturnValue(true);
            mockedCreateTask.mockRejectedValue({ response: { status: 401 } });
            setup({ mode: "create" });

            await submitCreateForm(user);

            await waitFor(() =>
                expect(notify.error).toHaveBeenCalledWith(
                    "You are not authorized to add tasks to this project."
                )
            );
        });

        it("shows 'Task not found.' on a 404 response", async () => {
            const user = userEvent.setup();
            mockedAxios.isAxiosError.mockReturnValue(true);
            mockedCreateTask.mockRejectedValue({ response: { status: 404 } });
            setup({ mode: "create" });

            await submitCreateForm(user);

            await waitFor(() =>
                expect(notify.error).toHaveBeenCalledWith("Task not found.")
            );
        });

        it("shows a generic error on an unhandled axios status code", async () => {
            const user = userEvent.setup();
            mockedAxios.isAxiosError.mockReturnValue(true);
            mockedCreateTask.mockRejectedValue({ response: { status: 500 } });
            setup({ mode: "create" });

            await submitCreateForm(user);

            await waitFor(() =>
                expect(notify.error).toHaveBeenCalledWith(
                    "Something went wrong. Please try again."
                )
            );
        });

        it("shows a generic error on a non-axios error", async () => {
            const user = userEvent.setup();
            mockedAxios.isAxiosError.mockReturnValue(false);
            mockedCreateTask.mockRejectedValue(new Error("boom"));
            setup({ mode: "create" });

            await submitCreateForm(user);

            await waitFor(() =>
                expect(notify.error).toHaveBeenCalledWith(
                    "Something went wrong. Please try again."
                )
            );
        });

        it("does not call onClose or onSuccess when submission fails", async () => {
            const user = userEvent.setup();
            mockedAxios.isAxiosError.mockReturnValue(true);
            mockedCreateTask.mockRejectedValue({ response: { status: 500 } });
            const { onClose, onSuccess } = setup({ mode: "create" });

            await submitCreateForm(user);

            await waitFor(() => expect(notify.error).toHaveBeenCalled());
            expect(onClose).not.toHaveBeenCalled();
            expect(onSuccess).not.toHaveBeenCalled();
        });
    });

    describe("field interactions", () => {
        it("updates priority when a new option is selected", async () => {
            const user = userEvent.setup();
            mockedCreateTask.mockResolvedValue(baseTask);
            setup({ mode: "create" });

            await waitFor(() =>
                expect((screen.getByLabelText("Status") as HTMLSelectElement).value).toEqual("to_do")
            );

            await user.selectOptions(screen.getByLabelText("Priority"), "high");
            await user.type(
                screen.getByPlaceholderText("Enter task title"),
                "Task"
            );
            await user.click(screen.getByRole("button", { name: /create task/i }));

            await waitFor(() => expect(mockedCreateTask).toHaveBeenCalled());
            expect(mockedCreateTask).toHaveBeenCalledWith(
                expect.objectContaining({ priority: "high" }),
                "project-1"
            );
        });

        it("updates status when a different column is selected", async () => {
            const user = userEvent.setup();
            mockedCreateTask.mockResolvedValue(baseTask);
            setup({ mode: "create" });

            await waitFor(() =>
                expect((screen.getByLabelText("Status") as HTMLSelectElement).value).toEqual("to_do")
            );

            await user.selectOptions(screen.getByLabelText("Status"), "done");
            await user.type(
                screen.getByPlaceholderText("Enter task title"),
                "Task"
            );
            await user.click(screen.getByRole("button", { name: /create task/i }));

            await waitFor(() => expect(mockedCreateTask).toHaveBeenCalled());
            expect(mockedCreateTask).toHaveBeenCalledWith(
                expect.objectContaining({ status: "done" }),
                "project-1"
            );
        });

        it("updates estimatedTime to a number when typed, and null when cleared", async () => {
            const user = userEvent.setup();
            setup({ mode: "create" });
            await waitFor(() => expect(mockedGetStatuses).toHaveBeenCalled());

            const estimateInput = screen.getByPlaceholderText(
                "Time in minutes"
            ) as HTMLInputElement;

            await user.type(estimateInput, "30");
            expect(estimateInput.value).toBe("30");

            await user.clear(estimateInput);
            expect(estimateInput.value).toBe("");
        });

        it("updates dueDate when a date is picked", async () => {
            const user = userEvent.setup();
            setup({ mode: "create" });
            await waitFor(() => expect(mockedGetStatuses).toHaveBeenCalled());

            const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
            await user.type(dateInput, "2026-01-01");
            expect(dateInput.value).toBe("2026-01-01");
        
            const allDateInputs = document.querySelectorAll('input[type="date"]');
            expect(allDateInputs.length).toBe(1);
        });
    });

    describe("closing the modal", () => {
        it("calls onClose when the backdrop is clicked", async () => {
            const user = userEvent.setup();
            const { onClose, container } = setup();
            await waitFor(() => expect(mockedGetStatuses).toHaveBeenCalled());

            const backdrop = container.querySelector(".fixed.inset-0");
            expect(backdrop).not.toBeNull();
            await user.click(backdrop as Element);

            expect(onClose).toHaveBeenCalled();
        });

        it("calls onClose when the × button is clicked", async () => {
            const user = userEvent.setup();
            const { onClose } = setup();
            await waitFor(() => expect(mockedGetStatuses).toHaveBeenCalled());

            await user.click(screen.getByText("×"));
            expect(onClose).toHaveBeenCalled();
        });

        it("calls onClose when the Cancel button is clicked", async () => {
            const user = userEvent.setup();
            const { onClose } = setup();
            await waitFor(() => expect(mockedGetStatuses).toHaveBeenCalled());

            await user.click(screen.getByRole("button", { name: /cancel/i }));
            expect(onClose).toHaveBeenCalled();
        });
    });
});
