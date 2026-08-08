import { TaskPriority } from "../enums/taskPriority";
import { TaskStatus } from "../enums/taskStatus";
import MissingRequiredDataException from "../exceptions/missingRequiredDataException";

export const checkQueryParams = (queryParams: { page?: number; limit?: number; sortBy?: string; sortOrder?: string; filterStatus?: string; filterPriority?: string; filterOverDue?: boolean }) => {
    const { page, limit, sortBy, sortOrder, filterStatus, filterPriority, filterOverDue } = queryParams;
    if ((page && page <= 0) || (limit && limit <= 0)) {
        throw new MissingRequiredDataException("Page and limit must be positive integers.");
    }

    if (sortBy && !["createdAt", "updatedAt", "title", "dueDate", "priority"].includes(sortBy)) {
        throw new MissingRequiredDataException("Invalid sortBy value. Must be one of: createdAt, updatedAt, title, dueDate, priority.");
    }

    if (sortOrder && !["asc", "desc"].includes(sortOrder)) {
        throw new MissingRequiredDataException("Invalid sortOrder value. Must be 'asc' or 'desc'.");
    }

    if (filterStatus && !Object.values(TaskStatus).includes(filterStatus as TaskStatus)) {
        throw new MissingRequiredDataException("Invalid filterStatus value. Must be one of: todo, in_progress, done.");
    }

    if (filterPriority && !Object.values(TaskPriority).includes(filterPriority as TaskPriority)) {
        throw new MissingRequiredDataException("Invalid filterPriority value. Must be one of: low, medium, high.");
    }

    if (filterOverDue !== undefined && typeof filterOverDue !== "boolean") {
        throw new MissingRequiredDataException("Invalid filterOverDue value. Must be a boolean.");
    }
}