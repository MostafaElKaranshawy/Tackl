import { afterEach, describe, expect, it, vi } from "vitest";
import {
    formatDate,
    formatFieldName,
    formatValue,
    getActionStyles,
} from "../../src/utils/taskHistoryUtils";

describe("taskHistoryUtils", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should format date correctly", () => {
        const date = "2024-06-01T12:00:00Z";
        const formattedDate = formatDate(date);
        expect(formattedDate).toBe("Jun 1, 2024, 3:00 PM");
    });

    it("should format field name correctly", () => {
        const fieldName = "user name";
        const formattedFieldName = formatFieldName(fieldName);
        expect(formattedFieldName).toBe("User name");
    });

    it("should format value correctly", () => {
        const value = "testValue";
        const formattedValue = formatValue(value);
        expect(formattedValue).toBe("testValue");
    });

    it("should return correct action styles for 'create' action", () => {
        const action = "created";
        const styles = getActionStyles(action);
        expect(styles).toEqual("bg-green-50 text-green-700 border-green-200");
    });

    it("should return correct action styles for 'update' action", () => {
        const action = "updated";
        const styles = getActionStyles(action);
        expect(styles).toEqual("bg-blue-50 text-blue-700 border-blue-200");
    });

    it("should return correct action styles for 'delete' action", () => {
        const action = "deleted";
        const styles = getActionStyles(action);
        expect(styles).toEqual("bg-red-50 text-red-700 border-red-200");
    });
});