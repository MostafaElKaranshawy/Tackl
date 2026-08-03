import { TaskPriority } from "../enums/taskPriority";
import { TaskStatus } from "../enums/taskStatus";
import MissingRequiredDataException from "../exceptions/missingRequiredDataException";

export const checkQueryParams = (queryParams: any) => {
    const { page, limit, sortBy, sortOrder, search, filterStatus, filterPriority, filterOverDue } = queryParams;
    if ((page && page <= 0) || (limit && limit <= 0)) {
        throw new MissingRequiredDataException("Page and limit must be positive integers.");
    }

    if (["createdAt", "updatedAt", "title", "dueDate", "priority"].indexOf(sortBy) === -1) {
        throw new MissingRequiredDataException("Invalid sortBy value. Must be one of: createdAt, updatedAt, title, dueDate, priority.");
    }

    if (["asc", "desc"].indexOf(sortOrder) === -1) {
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