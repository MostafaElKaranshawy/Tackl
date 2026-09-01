import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import HistoryCard from "../../../src/components/taskHistoryComponents/HistoryCard";
import type TaskHistory from "../../../src/types/taskHistory";
import { formatDate, formatFieldName, getActionStyles } from "../../../src/utils/taskHistoryUtils";


describe("HistoryCard", () => {
    const history: TaskHistory = {
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
            {
                id: "change-2",
                fieldName: "description",
                oldValue: "Old description",
                newValue: "New description",
                actionType: "updated",
                taskHistoryId: "history-1",
            },
        ],
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should render the history information", () => {

        render(<HistoryCard history={history} />);

        expect(
            screen.getByText("Title Updated")
        ).toBeInTheDocument();

        expect(
            screen.getByText(formatDate(history.createdAt))
        ).toBeInTheDocument();

        expect(
            screen.getByText("by John Doe")
        ).toBeInTheDocument();

    });

    it("should render the action type with the first letter capitalized", () => {
        render(<HistoryCard history={history} />);

        expect(
            screen.getByText("Title Updated")
        ).toBeInTheDocument();
    });

    it("should not render the action user when actionBy is not provided", () => {

        const historyWithoutActionBy: TaskHistory = {
            ...history,
            actionBy: undefined,
        };

        render(
            <HistoryCard
                history={historyWithoutActionBy}
            />
        );

        expect(
            screen.queryByText(/by John Doe/i)
        ).not.toBeInTheDocument();
    });

    it("should be collapsed initially", () => {
        render(<HistoryCard history={history} />);

        const button = screen.getByRole("button");

        expect(button).toHaveAttribute(
            "aria-expanded",
            "false"
        );

        expect(
            screen.queryByTestId("change-card")
        ).not.toBeInTheDocument();
    });

    it("should expand when the history button is clicked", () => {
        render(<HistoryCard history={history} />);

        const button = screen.getByRole("button");

        fireEvent.click(button);

        expect(button).toHaveAttribute(
            "aria-expanded",
            "true"
        );

    });

    it("should collapse when the history button is clicked again", () => {
        render(<HistoryCard history={history} />);

        const button = screen.getByRole("button");

        fireEvent.click(button);

        expect(button).toHaveAttribute(
            "aria-expanded",
            "true"
        );

        fireEvent.click(button);

        expect(button).toHaveAttribute(
            "aria-expanded",
            "false"
        );

    });

    it("should render all task changes when expanded", () => {
        render(<HistoryCard history={history} />);

        fireEvent.click(
            screen.getByRole("button")
        );

        expect(
            screen.getByText("Title")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Description")
        ).toBeInTheDocument();
    });

    it("should show no change details message when taskChanges is empty", () => {
        const historyWithoutChanges: TaskHistory = {
            ...history,
            taskChanges: [],
        };

        render(
            <HistoryCard
                history={historyWithoutChanges}
            />
        );

        fireEvent.click(
            screen.getByRole("button")
        );

        expect(
            screen.getByText(
                "No change details available."
            )
        ).toBeInTheDocument();

        expect(
            screen.queryByTestId("change-card")
        ).not.toBeInTheDocument();
    });

    it("should show no change details message when taskChanges is undefined", () => {
        const historyWithoutChanges: TaskHistory = {
            ...history,
            taskChanges: undefined,
        };

        render(
            <HistoryCard
                history={historyWithoutChanges}
            />
        );

        fireEvent.click(
            screen.getByRole("button")
        );

        expect(
            screen.getByText(
                "No change details available."
            )
        ).toBeInTheDocument();
    });

});