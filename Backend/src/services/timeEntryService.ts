import TimeEntryRepository from "../repositories/timeEntryRespository";
import TaskRepository from "../repositories/taskRepository";
import NotFoundException from "../exceptions/notFoundException";
import ForbiddenException from "../exceptions/forbiddenException";
import TimeEntry from "../models/timeEntry";

export default class TimeEntryService {
    static async createTimeEntry(userId: string, projectId: string, taskId: string, timeEntryData: Partial<TimeEntry>): Promise<TimeEntry | null> {

        await TimeEntryService.validateUserAccess(userId, projectId, taskId);

        return await TimeEntryRepository.createTimeEntry(taskId, timeEntryData);
    }

    static async getTimeEntryById(timeEntryId: string, userId: string, projectId: string, taskId: string): Promise<TimeEntry | null> {
        await TimeEntryService.validateUserAccess(userId, projectId, taskId);

        return await TimeEntryRepository.getTimeEntryById(taskId, timeEntryId);
    }

    static async updateTimeEntry(userId: string, projectId: string, taskId: string, timeEntryId: string, updatedData: Partial<TimeEntry>): Promise<TimeEntry | null> {

        await TimeEntryService.validateUserAccess(userId, projectId, taskId);

        return await TimeEntryRepository.updateTimeEntry(taskId, timeEntryId, updatedData);
    }

    static async deleteTimeEntry(userId: string, projectId: string, taskId: string, timeEntryId: string): Promise<void> {

        await TimeEntryService.validateUserAccess(userId, projectId, taskId);

        return await TimeEntryRepository.deleteTimeEntry(taskId, timeEntryId);
    }

    static async getTaskTimeEntries(userId: string, projectId: string, taskId: string): Promise<TimeEntry[]> {

        await TimeEntryService.validateUserAccess(userId, projectId, taskId);

        return await TimeEntryRepository.getTaskTimeEntries(taskId);
    }

    private static async validateUserAccess(userId: string, projectId: string, taskId: string): Promise<void> {
        const task = await TaskRepository.getTaskById(userId, projectId, taskId);
        if (!task) {
            throw new NotFoundException("Task not found.");
        }
        if (task.projectId !== projectId) {
            throw new ForbiddenException("Task does not belong to the specified project.");
        }
        if (task.project?.userId !== userId) {
            throw new ForbiddenException("User does not have access to this task.");
        }
    }
}