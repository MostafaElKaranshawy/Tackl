import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import TimeEntryListCard from "../../../src/components/timeEntriesComponents/TimeEntryListCard";
import { formatMinutes } from "../../../src/utils/timeFormater";
import type TimeEntry from "../../../src/types/timeEntry";

vi.mock("../../../src/utils/timeFormater", () => ({
    formatMinutes: vi.fn((minutes: number) => `${minutes} minutes`),
}));

describe("TimeEntryListCard", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    const mockTimeEntry = {
        id: "entry-1",
        duration: 90,
        date: "2023-08-01T10:00:00Z",
        note: "Worked on task implementation",
    } as TimeEntry;

    const renderTimeEntryListCard = (
        timeEntry: TimeEntry = mockTimeEntry,
        onClick = vi.fn(),
    ) => {
        return render(
            <TimeEntryListCard
                timeEntry={timeEntry}
                onClick={onClick}
            />
        );
    };

    describe("initial state", () => {
        it("should display the formatted duration", () => {
            renderTimeEntryListCard();

            expect(
                screen.getByText("90 minutes")
            ).toBeInTheDocument();

            expect(formatMinutes).toHaveBeenCalledWith(90);
        });

        it("should display the formatted date", () => {
            renderTimeEntryListCard();

            const expectedDate = new Date(
                mockTimeEntry.date
            ).toLocaleDateString();

            expect(
                screen.getByText(expectedDate)
            ).toBeInTheDocument();
        });

        it("should display the time entry note", () => {
            renderTimeEntryListCard();

            expect(
                screen.getByText("Worked on task implementation")
            ).toBeInTheDocument();
        });

        it("should display No note provided when the note is empty", () => {
            const timeEntry = {
                ...mockTimeEntry,
                note: "",
            } as TimeEntry;

            renderTimeEntryListCard(timeEntry);

            expect(
                screen.getByText("No note provided")
            ).toBeInTheDocument();
        });

        it("should display No note provided when the note contains only whitespace", () => {
            const timeEntry = {
                ...mockTimeEntry,
                note: "   ",
            } as TimeEntry;

            renderTimeEntryListCard(timeEntry);

            expect(
                screen.getByText("No note provided")
            ).toBeInTheDocument();
        });

        it("should display No note provided when the note is undefined", () => {
            const timeEntry = {
                ...mockTimeEntry,
                note: undefined,
            } as TimeEntry;

            renderTimeEntryListCard(timeEntry);

            expect(
                screen.getByText("No note provided")
            ).toBeInTheDocument();
        });
    });

    describe("user interaction", () => {
        it("should call onClick when the time entry card is clicked", async () => {
            const user = userEvent.setup();
            const onClick = vi.fn();

            renderTimeEntryListCard(
                mockTimeEntry,
                onClick
            );

            const card = screen.getByText(
                "Worked on task implementation"
            ).closest("div");

            expect(card).toBeInTheDocument();

            await user.click(card!);

            expect(onClick).toHaveBeenCalledTimes(1);
        });
    });
});