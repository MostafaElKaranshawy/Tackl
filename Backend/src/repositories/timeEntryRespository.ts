import DBException from "../exceptions/dbException";
import TimeEntry from "../models/timeEntry";

export default class TimeEntryRepository {
    static async createTimeEntry(taskId: string, timeEntryData: TimeEntry): Promise<TimeEntry> {
        try {
            const timeEntry = await TimeEntry.create({
                taskId: taskId,
                duration: timeEntryData.duration,
                date: timeEntryData.date,
                note: timeEntryData.note
            });
            return timeEntry;
        } catch (error) {
            throw new DBException("Failed to create time entry." + (error as Error).message, 500);
        }
    }

    static async getTimeEntryById(timeEntryId: string): Promise<TimeEntry | null> {
        try {
            const timeEntry = await TimeEntry.findByPk(timeEntryId);
            return timeEntry;
        } catch (error) {
            throw new DBException("Failed to retrieve time entry." + (error as Error).message, 500);
        }
    }

    static async updateTimeEntry(timeEntryId: string, updatedData: Partial<TimeEntry>): Promise<TimeEntry | null> {
        try {
            const timeEntry = await TimeEntry.findByPk(timeEntryId);
            if (!timeEntry) {
                throw new DBException("Time entry not found.", 404);
            }
            await timeEntry.update({
                duration: updatedData.duration ?? timeEntry.duration,
                date: updatedData.date ?? timeEntry.date,
                note: updatedData.note ?? timeEntry.note
            });
            return timeEntry;
        } catch (error) {
            throw new DBException("Failed to update time entry." + (error as Error).message, 500);
        }
    }

    static async deleteTimeEntry(timeEntryId: string): Promise<void> {
        try {
            const timeEntry = await TimeEntry.findByPk(timeEntryId);
            if (!timeEntry) {
                throw new DBException("Time entry not found.", 404);
            }
            await timeEntry.destroy();
        } catch (error) {
            throw new DBException("Failed to delete time entry." + (error as Error).message, 500);
        }
    }

    static async getTaskTimeEntries(taskId: string): Promise<TimeEntry[]> {
        try {
            const timeEntries = await TimeEntry.findAll({
                where: {
                    taskId: taskId
                }
            });
            return timeEntries;
        } catch (error) {
            throw new DBException("Failed to retrieve time entries for task." + (error as Error).message, 500);
        }
    }

    static async getTimeEntryTaskId(timeEntryId: string): Promise<string | null> {
        try {
            const timeEntry = await TimeEntry.findByPk(timeEntryId, {
                attributes: ['taskId']
            });
            return timeEntry ? timeEntry.taskId : null;
        } catch (error) {
            throw new DBException("Failed to retrieve task ID for time entry." + (error as Error).message, 500);
        }
    }
}