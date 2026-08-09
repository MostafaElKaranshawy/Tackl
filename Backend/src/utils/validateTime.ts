import logger from '../config/logger';

export function validateTime(time: number): boolean {
    if (!Number.isInteger(time)) {
        logger.warn("Invalid time format. Expected an integer.");
        return false;
    }
    return time >= 0 && time <= 2359;
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