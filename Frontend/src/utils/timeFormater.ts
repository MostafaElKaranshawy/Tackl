export function formatMinutes(totalMinutes: number): string {
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;

    const parts: string[] = [];

    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes || parts.length === 0) parts.push(`${minutes}m`);

    return parts.join(" ");
}