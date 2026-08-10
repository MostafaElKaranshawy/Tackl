import type TaskHistory from "../types/taskHistory";

function formatDate(date: string) {
    return new Date(date).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function formatFieldName(fieldName: string) {
    return fieldName
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (char) => char.toUpperCase());
}

function formatValue(value: string | null | undefined) {
    return value === null || value === undefined || value === ""
        ? "—"
        : value;
}

function getActionStyles(actionType: TaskHistory["actionType"]) {
    switch (actionType) {
        case "created":
            return "bg-green-50 text-green-700 border-green-200";

        case "updated":
            return "bg-blue-50 text-blue-700 border-blue-200";

        case "deleted":
            return "bg-red-50 text-red-700 border-red-200";
    }
}

export {
    formatDate,
    formatFieldName,
    formatValue,
    getActionStyles,
}