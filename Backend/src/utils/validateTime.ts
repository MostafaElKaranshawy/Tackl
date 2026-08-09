export function validateTime(time: number): boolean {
    if (!Number.isInteger(time)) {
        return false;
    }
    return time >= 0 && time <= 2359;
}

export function validateDate(date: Date): boolean {
    try {
        let formated = new Date(date);
        if (!(formated instanceof Date) || isNaN(formated.getTime())) {
            console.log("Validating date:", formated);
            return false;
        }

        const now = new Date();
        return formated <= now;
    } catch (error) {
        return false;
    }
}