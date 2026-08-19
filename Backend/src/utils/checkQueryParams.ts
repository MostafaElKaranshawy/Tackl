import { TaskPriority } from "../enums/taskPriority";
import MissingRequiredDataException from "../exceptions/missingRequiredDataException";

export const checkQueryParams = (queryParams: { page?: number; limit?: number; sortBy?: string; sortOrder?: string; filterPriority?: string; filterOverDue?: boolean }) => {
    const { page, limit, sortBy, sortOrder, filterPriority, filterOverDue } = queryParams;
    if ((page && page <= 0) || (limit && limit <= 0)) {
        throw new MissingRequiredDataException("Page and limit must be positive integers.");
    }

    if (sortBy && !["createdAt", "updatedAt", "title", "dueDate", "priority"].includes(sortBy)) {
        throw new MissingRequiredDataException("Invalid sortBy value. Must be one of: createdAt, updatedAt, title, dueDate, priority.");
    }

    if (sortOrder && !["asc", "desc"].includes(sortOrder)) {
        throw new MissingRequiredDataException("Invalid sortOrder value. Must be 'asc' or 'desc'.");
    }


    if (filterPriority && !Object.values(TaskPriority).includes(filterPriority as TaskPriority)) {
        throw new MissingRequiredDataException("Invalid filterPriority value. Must be one of: low, medium, high.");
    }

    if (filterOverDue !== undefined && typeof filterOverDue !== "boolean") {
        throw new MissingRequiredDataException("Invalid filterOverDue value. Must be a boolean.");
    }
}