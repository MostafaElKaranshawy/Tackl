import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import TimeEntryManageModal from "../../../src/components/timeEntriesComponents/TimeEntryManageModal";
import {
    createTimeEntry,
    deleteTimeEntry,
    updateTimeEntry,
} from "../../../src/services/timeEntriesService";
import { notify } from "../../../src/utils/notify";
import type TimeEntry from "../../../src/types/timeEntry";

vi.mock("../../../src/services/timeEntriesService", () => ({
    createTimeEntry: vi.fn(),
    deleteTimeEntry: vi.fn(),
    updateTimeEntry: vi.fn(),
}));

vi.mock("../../../src/utils/notify", () => ({
    notify: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

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
                    Confirm Delete
                </button>

                <button onClick={onCancel}>
                    Cancel Delete
                </button>
            </div>
        ),
    })
);

describe("TimeEntryManageModal", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    const mockTimeEntry = {
        id: "entry-1",
        duration: 90,
        date: "2023-08-01T10:00:00Z",
        note: "Worked on task implementation",
    } as TimeEntry;

    const renderTimeEntryManageModal = (
        timeEntry?: TimeEntry,
        onClose = vi.fn(),
        onUpdate = vi.fn(),
    ) => {
        return render(
            <TimeEntryManageModal
                projectId="project-1"
                taskId="task-1"
                timeEntry={timeEntry}
                onClose={onClose}
                onUpdate={onUpdate}
            />
        );
    };

    describe("create mode", () => {
        it("should display the create time entry modal", () => {
            renderTimeEntryManageModal();

            expect(
                screen.getByText("Create Time Entry")
            ).toBeInTheDocument();

            expect(
                screen.getByRole("button", {
                    name: "Create",
                })
            ).toBeInTheDocument();
        });

        it("should display the default duration as zero", () => {
            renderTimeEntryManageModal();

            const durationInput = document.querySelector(
                'input[type="number"]'
            ) as HTMLInputElement;

            expect(durationInput.value).toBe("0");
        });

        it("should display today's date by default", () => {
            renderTimeEntryManageModal();

            const dateInput = document.querySelector(
                'input[type="date"]'
            ) as HTMLInputElement;

            const today = new Date()
                .toISOString()
                .split("T")[0];

            expect(dateInput.value).toBe(today);
        });

        it("should allow entering duration, date and note", async () => {
            const user = userEvent.setup();

            renderTimeEntryManageModal();

            const durationInput = document.querySelector(
                'input[type="number"]'
            ) as HTMLInputElement;

            const dateInput = document.querySelector(
                'input[type="date"]'
            ) as HTMLInputElement;

            const noteInput = document.querySelector(
                'textarea'
            ) as HTMLTextAreaElement;

            await user.clear(durationInput);
            await user.type(durationInput, "60");

            await user.clear(dateInput);
            await user.type(dateInput, "2023-08-10");

            await user.type(
                noteInput,
                "Worked on frontend"
            );

            expect(durationInput).toHaveValue(60);
            expect(dateInput).toHaveValue("2023-08-10");
            expect(noteInput).toHaveValue(
                "Worked on frontend"
            );
        });
    });

    describe("create time entry", () => {
        it("should call createTimeEntry with the correct data", async () => {
            const user = userEvent.setup();

            const createdTimeEntry = {
                ...mockTimeEntry,
                id: "entry-created",
            };

            vi.mocked(createTimeEntry).mockResolvedValue(
                createdTimeEntry
            );

            const onUpdate = vi.fn();

            renderTimeEntryManageModal(
                undefined,
                vi.fn(),
                onUpdate
            );

            const durationInput = document.querySelector(
                'input[type="number"]'
            ) as HTMLInputElement;

            const dateInput = document.querySelector(
                'input[type="date"]'
            ) as HTMLInputElement;

            const noteInput = document.querySelector(
                'textarea'
            ) as HTMLTextAreaElement;

            await user.clear(durationInput);
            await user.type(durationInput, "90");

            await user.clear(dateInput);
            await user.type(dateInput, "2023-08-10");

            await user.type(
                noteInput,
                "Worked on task"
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Create",
                })
            );

            await waitFor(() => {
                expect(createTimeEntry).toHaveBeenCalledWith(
                    "project-1",
                    "task-1",
                    {
                        duration: 90,
                        date: "2023-08-10",
                        note: "Worked on task",
                    }
                );
            });
        });

        it("should call onUpdate after successfully creating a time entry", async () => {
            const user = userEvent.setup();

            vi.mocked(createTimeEntry).mockResolvedValue(
                mockTimeEntry
            );

            const onUpdate = vi.fn();

            renderTimeEntryManageModal(
                undefined,
                vi.fn(),
                onUpdate
            );

            const durationInput = document.querySelector(
                'input[type="number"]'
            ) as HTMLInputElement;

            await user.clear(durationInput);
            await user.type(durationInput, "90");

            await user.click(
                screen.getByRole("button", {
                    name: "Create",
                })
            );

            await waitFor(() => {
                expect(onUpdate).toHaveBeenCalledTimes(1);
            });
        });

        it("should switch to show mode after successfully creating a time entry", async () => {
            const user = userEvent.setup();

            vi.mocked(createTimeEntry).mockResolvedValue(
                mockTimeEntry
            );

            renderTimeEntryManageModal();

            const durationInput = document.querySelector(
                'input[type="number"]'
            ) as HTMLInputElement;

            await user.clear(durationInput);
            await user.type(durationInput, "90");

            await user.click(
                screen.getByRole("button", {
                    name: "Create",
                })
            );

            expect(
                await screen.findByText("Time Entry")
            ).toBeInTheDocument();

            expect(
                screen.getByRole("button", {
                    name: "Close",
                })
            ).toBeInTheDocument();
        });

        it("should display an error when creating a time entry fails", async () => {
            const user = userEvent.setup();

            vi.mocked(createTimeEntry).mockRejectedValue(
                new Error("Create failed")
            );

            renderTimeEntryManageModal();

            const durationInput = document.querySelector(
                'input[type="number"]'
            ) as HTMLInputElement;

            await user.clear(durationInput);
            await user.type(durationInput, "90");

            await user.click(
                screen.getByRole("button", {
                    name: "Create",
                })
            );

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "Failed to save time entry."
                );
            });
        });
    });

    describe("validation", () => {
        it("should display validation errors when duration is missing", async () => {
            const user = userEvent.setup();

            renderTimeEntryManageModal();

            await user.click(
                screen.getByRole("button", {
                    name: "Create",
                })
            );

            expect(
                screen.getByText("Duration is required.")
            ).toBeInTheDocument();

            expect(notify.error).toHaveBeenCalledWith(
                "Duration and date are required."
            );

            expect(createTimeEntry).not.toHaveBeenCalled();
        });

        it("should display validation errors when date is missing", async () => {
            const user = userEvent.setup();

            renderTimeEntryManageModal();

            const durationInput = document.querySelector(
                'input[type="number"]'
            ) as HTMLInputElement;

            await user.clear(durationInput);
            await user.type(durationInput, "60");

            const dateInput = document.querySelector(
                'input[type="date"]'
            ) as HTMLInputElement;

            await user.clear(dateInput);

            await user.click(
                screen.getByRole("button", {
                    name: "Create",
                })
            );

            expect(
                screen.getByText("Date is required.")
            ).toBeInTheDocument();

            expect(notify.error).toHaveBeenCalledWith(
                "Duration and date are required."
            );

            expect(createTimeEntry).not.toHaveBeenCalled();
        });

        it("should reject a future date", async () => {
            const user = userEvent.setup();

            renderTimeEntryManageModal();

            const durationInput = document.querySelector(
                'input[type="number"]'
            ) as HTMLInputElement;

            await user.clear(durationInput);
            await user.type(durationInput, "60");

            const dateInput = document.querySelector(
                'input[type="date"]'
            ) as HTMLInputElement;

            await user.clear(dateInput);
            await user.type(dateInput, "2099-01-01");

            await user.click(
                screen.getByRole("button", {
                    name: "Create",
                })
            );

            expect(
                screen.getByText("Date cannot be in the future.")
            ).toBeInTheDocument();

            expect(notify.error).toHaveBeenCalledWith(
                "Date cannot be in the future."
            );

            expect(createTimeEntry).not.toHaveBeenCalled();
        });
    });

    describe("show mode", () => {
        it("should display the time entry information", () => {
            renderTimeEntryManageModal(mockTimeEntry);

            expect(
                screen.getByText("Time Entry")
            ).toBeInTheDocument();

            expect(
                screen.getByDisplayValue("90")
            ).toBeInTheDocument();

            expect(
                screen.getByDisplayValue(
                    "Worked on task implementation"
                )
            ).toBeInTheDocument();
        });


        it("should display the edit and delete buttons", () => {
            renderTimeEntryManageModal(mockTimeEntry);

            expect(
                screen.getAllByRole("button", {
                    name: "",
                }).length
            ).toBe(2);
        });

        it("should display the Close button", () => {
            renderTimeEntryManageModal(mockTimeEntry);

            expect(
                screen.getByRole("button", {
                    name: "Close",
                })
            ).toBeInTheDocument();
        });
    });

    describe("edit mode", () => {
        it("should switch to edit mode when the edit button is clicked", async () => {
            const user = userEvent.setup();

            renderTimeEntryManageModal(mockTimeEntry);

            const buttons = screen.getAllByRole("button");

            await user.click(buttons[0]);

            expect(
                screen.getByText("Edit Time Entry")
            ).toBeInTheDocument();

            expect(
                screen.getByRole("button", {
                    name: "Save Changes",
                })
            ).toBeInTheDocument();

            expect(
                screen.getByRole("button", {
                    name: "Discard",
                })
            ).toBeInTheDocument();
        });

        it("should return to show mode when Discard is clicked", async () => {
            const user = userEvent.setup();

            renderTimeEntryManageModal(mockTimeEntry);

            const buttons = screen.getAllByRole("button");

            await user.click(buttons[0]);

            expect(
                screen.getByText("Edit Time Entry")
            ).toBeInTheDocument();

            await user.click(
                screen.getByRole("button", {
                    name: "Discard",
                })
            );

            expect(
                screen.getByText("Time Entry")
            ).toBeInTheDocument();

            expect(
                screen.getByDisplayValue("90")
            ).toBeInTheDocument();
        });

        it("should display an error when updating a time entry fails", async () => {
            const user = userEvent.setup();

            vi.mocked(updateTimeEntry).mockRejectedValue(
                new Error("Update failed")
            );

            renderTimeEntryManageModal(mockTimeEntry);

            const buttons = screen.getAllByRole("button");

            await user.click(buttons[0]);

            await user.click(
                screen.getByRole("button", {
                    name: "Save Changes",
                })
            );

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "Failed to save time entry."
                );
            });
        });
    });

    describe("delete time entry", () => {
        it("should display the confirmation modal when delete is clicked", async () => {
            const user = userEvent.setup();

            renderTimeEntryManageModal(mockTimeEntry);

            const buttons = screen.getAllByRole("button");

            await user.click(buttons[1]);

            expect(
                screen.getByTestId("confirmation-modal")
            ).toBeInTheDocument();

            expect(
                screen.getByText("Delete Time Entry")
            ).toBeInTheDocument();

            expect(
                screen.getByText(
                    "Are you sure you want to delete this time entry? This action cannot be undone."
                )
            ).toBeInTheDocument();
        });

        it("should cancel the delete confirmation", async () => {
            const user = userEvent.setup();

            renderTimeEntryManageModal(mockTimeEntry);

            const buttons = screen.getAllByRole("button");

            await user.click(buttons[1]);

            await user.click(
                screen.getByRole("button", {
                    name: "Cancel Delete",
                })
            );

            expect(
                screen.queryByTestId("confirmation-modal")
            ).not.toBeInTheDocument();

            expect(deleteTimeEntry).not.toHaveBeenCalled();
        });

        it("should delete the time entry when deletion is confirmed", async () => {
            const user = userEvent.setup();

            vi.mocked(deleteTimeEntry).mockResolvedValue(
                undefined
            );

            const onClose = vi.fn();
            const onUpdate = vi.fn();

            renderTimeEntryManageModal(
                mockTimeEntry,
                onClose,
                onUpdate
            );

            const buttons = screen.getAllByRole("button");

            await user.click(buttons[1]);

            await user.click(
                screen.getByRole("button", {
                    name: "Confirm Delete",
                })
            );

            await waitFor(() => {
                expect(deleteTimeEntry).toHaveBeenCalledWith(
                    "project-1",
                    "task-1",
                    "entry-1"
                );
            });

            expect(notify.success).toHaveBeenCalledWith(
                "Time entry deleted."
            );

            expect(onUpdate).toHaveBeenCalledTimes(1);
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("should display an error when deleting a time entry fails", async () => {
            const user = userEvent.setup();

            vi.mocked(deleteTimeEntry).mockRejectedValue(
                new Error("Delete failed")
            );

            renderTimeEntryManageModal(mockTimeEntry);

            const buttons = screen.getAllByRole("button");

            await user.click(buttons[1]);

            await user.click(
                screen.getByRole("button", {
                    name: "Confirm Delete",
                })
            );

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "Failed to delete time entry."
                );
            });
        });
    });

    describe("modal closing", () => {
        it("should call onClose when the Close button is clicked", async () => {
            const user = userEvent.setup();

            const onClose = vi.fn();

            renderTimeEntryManageModal(
                mockTimeEntry,
                onClose
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Close",
                })
            );

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("should call onClose when clicking outside the modal", async () => {
            const onClose = vi.fn();

            renderTimeEntryManageModal(
                mockTimeEntry,
                onClose
            );

            const overlay = document.querySelector(
                ".fixed.inset-0"
            );

            expect(overlay).toBeInTheDocument();

            await userEvent.setup().click(overlay!);

            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});