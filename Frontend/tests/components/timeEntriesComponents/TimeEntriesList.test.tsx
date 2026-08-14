import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import TimeEntriesList from "../../../src/components/timeEntriesComponents/TimeEntriesList";
import { getTaskTimeEntries } from "../../../src/services/timeEntriesService";
import { notify } from "../../../src/utils/notify";
import { formatMinutes } from "../../../src/utils/timeFormater";
import TimeEntry from "../../../src/types/timeEntry";

vi.mock("../../../src/services/timeEntriesService", () => ({
    getTaskTimeEntries: vi.fn(),
}));

vi.mock("../../../src/utils/notify", () => ({
    notify: {
        error: vi.fn(),
    },
}));

vi.mock("../../../src/utils/timeFormater", () => ({
    formatMinutes: vi.fn((minutes: number) => `${minutes} minutes`),
}));

vi.mock("../../../src/components/timeEntriesComponents/TimeEntryListCard", () => ({
    default: ({
        timeEntry,
        onClick,
    }: {
        timeEntry: {
            id: string;
            duration: number;
        };
        onClick: () => void;
    }) => (
        <div
            data-testid={`time-entry-${timeEntry.id}`}
            onClick={onClick}
        >
            Time Entry {timeEntry.id}
        </div>
    ),
}));

vi.mock("../../../src/components/timeEntries/TimeEntryManageModal", () => ({
    default: ({
        timeEntry,
        onClose,
        onUpdate,
    }: {
        timeEntry?: {
            id: string;
            duration: number;
        };
        onClose: () => void;
        onUpdate: () => void;
    }) => (
        <div data-testid="time-entry-manage-modal">
            {timeEntry ? (
                <span>Editing {timeEntry.id}</span>
            ) : (
                <span>Creating Time Entry</span>
            )}

            <button onClick={onClose}>
                Close
            </button>

            <button onClick={onUpdate}>
                Update
            </button>
        </div>
    ),
}));

describe("TimeEntriesList", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    const mockTimeEntries = [
        {
            id: "entry-1",
            duration: 60,
            date: "2023-08-01T10:00:00Z",
        },
        {
            id: "entry-2",
            duration: 90,
            date: "2023-08-02T11:00:00Z",
        },
    ] as TimeEntry[];

    const renderTimeEntriesList = (
        currentScreen = "task-page",
        updateTotalTime = vi.fn(),
    ) => {
        return render(
            <TimeEntriesList
                projectId="project-1"
                taskId="task-1"
                currentScreen={currentScreen}
                updateTotalTime={updateTotalTime}
            />
        );
    };

    describe("initial state", () => {
        it("should display the time entries section", () => {
            vi.mocked(getTaskTimeEntries).mockResolvedValue([]);

            renderTimeEntriesList();

            expect(
                screen.getByText("Logged Time Entries")
            ).toBeInTheDocument();

            expect(
                screen.getByText(/Total Time Logged:/)
            ).toBeInTheDocument();
        });

        it("should display the empty state when there are no time entries", async () => {
            vi.mocked(getTaskTimeEntries).mockResolvedValue([]);

            renderTimeEntriesList();

            expect(
                await screen.findByText("No time entries found")
            ).toBeInTheDocument();

            expect(
                screen.getByText(
                    "Start tracking time to see entries here."
                )
            ).toBeInTheDocument();
        });

        it("should display the Add Time Entry button on the task page", () => {
            vi.mocked(getTaskTimeEntries).mockResolvedValue([]);

            renderTimeEntriesList("task-page");

            expect(
                screen.getByRole("button", {
                    name: "Add Time Entry",
                })
            ).toBeInTheDocument();
        });

        it("should not display the Add Time Entry button on other screens", () => {
            vi.mocked(getTaskTimeEntries).mockResolvedValue([]);

            renderTimeEntriesList("other-screen");

            expect(
                screen.queryByRole("button", {
                    name: "Add Time Entry",
                })
            ).not.toBeInTheDocument();
        });
    });

    describe("fetching time entries", () => {
        it("should call getTaskTimeEntries with the correct project and task ids", async () => {
            vi.mocked(getTaskTimeEntries).mockResolvedValue([]);

            renderTimeEntriesList();

            await waitFor(() => {
                expect(getTaskTimeEntries).toHaveBeenCalledWith(
                    "project-1",
                    "task-1"
                );
            });
        });

        it("should display the fetched time entries", async () => {
            vi.mocked(getTaskTimeEntries).mockResolvedValue(
                mockTimeEntries
            );

            renderTimeEntriesList();

            expect(
                await screen.findByTestId("time-entry-entry-1")
            ).toBeInTheDocument();

            expect(
                screen.getByTestId("time-entry-entry-2")
            ).toBeInTheDocument();
        });

        it("should calculate and update the total time", async () => {
            const updateTotalTime = vi.fn();

            vi.mocked(getTaskTimeEntries).mockResolvedValue(
                mockTimeEntries
            );

            renderTimeEntriesList(
                "task-page",
                updateTotalTime
            );

            await waitFor(() => {
                expect(updateTotalTime).toHaveBeenCalledWith(150);
            });
        });

        it("should format the total time", async () => {
            vi.mocked(getTaskTimeEntries).mockResolvedValue(
                mockTimeEntries
            );

            renderTimeEntriesList();

            await waitFor(() => {
                expect(formatMinutes).toHaveBeenCalledWith(150);
            });
        });

        it("should handle an error when fetching time entries", async () => {
            vi.mocked(getTaskTimeEntries).mockRejectedValue(
                new Error("Failed to fetch time entries")
            );

            renderTimeEntriesList();

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "Error fetching time entries. Please try again later."
                );
            });
        });
    });

    describe("time entry updates", () => {

        it("should fetch time entries again when the modal is closed", async () => {
            const user = userEvent.setup();

            vi.mocked(getTaskTimeEntries).mockResolvedValue(
                mockTimeEntries
            );

            renderTimeEntriesList();

            const entry = await screen.findByTestId(
                "time-entry-entry-1"
            );

            await user.click(entry);

            expect(getTaskTimeEntries).toHaveBeenCalledTimes(1);

            await user.click(
                screen.getByRole("button", {
                    name: "Close",
                })
            );

            await waitFor(() => {
                expect(getTaskTimeEntries).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe("missing project or task id", () => {
        it("should not fetch time entries when taskId is missing", () => {
            vi.mocked(getTaskTimeEntries).mockResolvedValue([]);

            render(
                <TimeEntriesList
                    projectId="project-1"
                    taskId=""
                    currentScreen="task-page"
                    updateTotalTime={vi.fn()}
                />
            );

            expect(getTaskTimeEntries).not.toHaveBeenCalled();
        });

        it("should not fetch time entries when projectId is missing", () => {
            vi.mocked(getTaskTimeEntries).mockResolvedValue([]);

            render(
                <TimeEntriesList
                    projectId=""
                    taskId="task-1"
                    currentScreen="task-page"
                    updateTotalTime={vi.fn()}
                />
            );

            expect(getTaskTimeEntries).not.toHaveBeenCalled();
        });
    });
});