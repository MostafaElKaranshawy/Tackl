import logger from '../config/logger';

export function validateTime(time: number): boolean {
    if (!Number.isInteger(time)) {
        logger.warn("Invalid time format. Expected an integer.");
        return false;
    }
    return time > 0;
}

export function validateDate(date: Date): boolean {
    try {
        const formated = new Date(date);
        if (!(formated instanceof Date) || isNaN(formated.getTime())) {
            logger.warn("Invalid date format. Expected a valid Date object.");
            return false;
        }

        const now = new Date();
        return formated <= now;
    } catch {
        return false;
    }
}
export function compareDates(
    oldValue: unknown,
    newValue: unknown
): boolean {
    if (oldValue instanceof Date && newValue instanceof Date) {
        return oldValue.getTime() === newValue.getTime();
    }

    if (oldValue instanceof Date && typeof newValue === "string") {
        return oldValue.getTime() === new Date(newValue).getTime();
    }

    if (typeof oldValue === "string" && newValue instanceof Date) {
        return new Date(oldValue).getTime() === newValue.getTime();
    }

    return oldValue === newValue;
}