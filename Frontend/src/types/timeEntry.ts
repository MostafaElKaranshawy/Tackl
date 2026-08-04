export default interface TimeEntry {
    id: string;
    taskId: string;
    duration: number;
    date: string;
    note?: string | null;
}