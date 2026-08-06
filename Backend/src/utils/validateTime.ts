export function validateTime(time: number): boolean {
    if (!Number.isInteger(time)) {
        return false;
    }
    return time >= 0 && time <= 2359;
}

export function validateDate(date: Date): boolean {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return false;
    }
    const now = new Date();
    return date < now;
}