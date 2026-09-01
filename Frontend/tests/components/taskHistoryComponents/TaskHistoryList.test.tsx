import {
    afterEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import TaskHistoryList from "../../../src/components/taskHistoryComponents/TaskHistoryList";
import type TaskHistory from "../../../src/types/taskHistory";
import { getTaskHistory } from "../../../src/services/taskHistoryService";
import { notify } from "../../../src/utils/notify";

vi.mock("../../../src/services/taskHistoryService", () => ({
    getTaskHistory: vi.fn(),
}));

vi.mock("../../../src/utils/notify", () => ({
    notify: {
        error: vi.fn(),
    },
}));

vi.mock(
    "../../../src/components/taskHistory/HistoryCard",
    () => ({
        default: ({
            history,
        }: {
            history: TaskHistory;
        }) => (
            <div data-testid="history-card">
                {history.fieldName}
            </div>
        ),
    })
);

vi.mock("react-icons/io", () => ({
    IoMdClose: () => (
        <span data-testid="close-icon" />
    ),
}));

describe("TaskHistoryList", () => {
    const mockCloseTaskHistoryList = vi.fn();

    const historyData: TaskHistory[] = [
        {
            id: "history-1",
            taskId: "task-1",
            userId: "user-1",
            createdAt: "2026-08-10T10:00:00.000Z",
            updatedAt: "2026-08-10T10:00:00.000Z",
            fieldName: "title",
            actionType: "updated",
            actionBy: {
                name: "John Doe",
            },
            taskChanges: [
                {
                    id: "change-1",
                    fieldName: "title",
                    oldValue: "Old title",
                    newValue: "New title",
                    actionType: "updated",
                    taskHistoryId: "history-1",
                },
            ],
        },
        {
            id: "history-2",
            taskId: "task-1",
            userId: "user-1",
            createdAt: "2026-08-10T11:00:00.000Z",
            updatedAt: "2026-08-10T11:00:00.000Z",
            fieldName: "description",
            actionType: "updated",
            actionBy: {
                name: "John Doe",
            },
            taskChanges: [
                {
                    id: "change-2",
                    fieldName: "description",
                    oldValue: "Old description",
                    newValue: "New description",
                    actionType: "updated",
                    taskHistoryId: "history-2",
                },
            ],
        },
    ];

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should render the task history modal", () => {
        render(
            <TaskHistoryList
                taskId="task-1"
                projectId="project-1"
                closeTaskHistoryList={
                    mockCloseTaskHistoryList
                }
            />
        );

        expect(
            screen.getByRole("heading", {
                name: "Task History",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "View changes made to this task"
            )
        ).toBeInTheDocument();
    });

    it("should fetch task history when taskId and projectId are provided", async () => {
        vi.mocked(getTaskHistory).mockResolvedValue(
            historyData
        );

        render(
            <TaskHistoryList
                taskId="task-1"
                projectId="project-1"
                closeTaskHistoryList={
                    mockCloseTaskHistoryList
                }
            />
        );

        await waitFor(() => {
            expect(getTaskHistory).toHaveBeenCalledWith(
                "project-1",
                "task-1"
            );
        });

        expect(getTaskHistory).toHaveBeenCalledTimes(1);
    });

    it("should not fetch task history when taskId is missing", async () => {
        render(
            <TaskHistoryList
                taskId=""
                projectId="project-1"
                closeTaskHistoryList={
                    mockCloseTaskHistoryList
                }
            />
        );

        await waitFor(() => {
            expect(getTaskHistory).not.toHaveBeenCalled();
        });
    });

    it("should not fetch task history when projectId is missing", async () => {
        render(
            <TaskHistoryList
                taskId="task-1"
                projectId=""
                closeTaskHistoryList={
                    mockCloseTaskHistoryList
                }
            />
        );

        await waitFor(() => {
            expect(getTaskHistory).not.toHaveBeenCalled();
        });
    });

    it("should show no history message when history is empty", async () => {
        vi.mocked(getTaskHistory).mockResolvedValue([]);

        render(
            <TaskHistoryList
                taskId="task-1"
                projectId="project-1"
                closeTaskHistoryList={
                    mockCloseTaskHistoryList
                }
            />
        );

        expect(
            await screen.findByText(
                "No history available."
            )
        ).toBeInTheDocument();

        expect(
            screen.queryByTestId("history-card")
        ).not.toBeInTheDocument();
    });

    it("should close the modal when clicking the close button", () => {
        render(
            <TaskHistoryList
                taskId="task-1"
                projectId="project-1"
                closeTaskHistoryList={
                    mockCloseTaskHistoryList
                }
            />
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Close history",
            })
        );

        expect(
            mockCloseTaskHistoryList
        ).toHaveBeenCalledTimes(1);
    });

    it("should close the modal when clicking the backdrop", () => {
        const { container } = render(
            <TaskHistoryList
                taskId="task-1"
                projectId="project-1"
                closeTaskHistoryList={
                    mockCloseTaskHistoryList
                }
            />
        );

        const backdrop = container.firstElementChild;

        expect(backdrop).toBeInTheDocument();

        fireEvent.click(backdrop!);

        expect(
            mockCloseTaskHistoryList
        ).toHaveBeenCalledTimes(1);
    });

    it("should not close the modal when clicking inside the modal", () => {
        render(
            <TaskHistoryList
                taskId="task-1"
                projectId="project-1"
                closeTaskHistoryList={
                    mockCloseTaskHistoryList
                }
            />
        );

        fireEvent.click(
            screen.getByRole("heading", {
                name: "Task History",
            })
        );

        expect(
            mockCloseTaskHistoryList
        ).not.toHaveBeenCalled();
    });

    it("should show an error notification when history is not found", async () => {
        const error = {
            response: {
                status: 404,
            },
            isAxiosError: true,
        };

        vi.mocked(getTaskHistory).mockRejectedValue(
            error
        );

        render(
            <TaskHistoryList
                taskId="task-1"
                projectId="project-1"
                closeTaskHistoryList={
                    mockCloseTaskHistoryList
                }
            />
        );

        await waitFor(() => {
            expect(notify.error).toHaveBeenCalledWith(
                "Task history not found."
            );
        });
    });

    it("should show a forbidden error notification", async () => {
        const error = {
            response: {
                status: 403,
            },
            isAxiosError: true,
        };

        vi.mocked(getTaskHistory).mockRejectedValue(
            error
        );

        render(
            <TaskHistoryList
                taskId="task-1"
                projectId="project-1"
                closeTaskHistoryList={
                    mockCloseTaskHistoryList
                }
            />
        );

        await waitFor(() => {
            expect(notify.error).toHaveBeenCalledWith(
                "You do not have permission to view this task history."
            );
        });
    });
});