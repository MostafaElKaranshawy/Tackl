import TimeEntryRepository from "../repositories/timeEntryRespository";
import TaskRepository from "../repositories/taskRepository";
import NotFoundException from "../exceptions/notFoundException";
import ForbiddenException from "../exceptions/forbiddenException";

export default class TimeEntryService {
    static async createTimeEntry(userId: string, timeEntryData: any): Promise<any> {
        try {

            await TimeEntryService.validateUserAccess(userId, timeEntryData.taskId);

            return await TimeEntryRepository.createTimeEntry(timeEntryData.taskId, timeEntryData);
        } catch (error) {
            throw error;
        }
    }

    static async getTimeEntryById(timeEntryId: string, userId: string, taskId: string): Promise<any> {
        try {

            await TimeEntryService.validateUserAccess(userId, taskId);

            return await TimeEntryRepository.getTimeEntryById(timeEntryId);
        } catch (error) {
            console.error("Error in getTimeEntryById:", error);
            throw error;
        }
    }

    static async updateTimeEntry(userId: string, updatedData: any): Promise<any> {
        try {

            await TimeEntryService.validateUserAccess(userId, updatedData.taskId);

            return await TimeEntryRepository.updateTimeEntry(updatedData.timeEntryId, {
                duration: updatedData.duration,
                date: updatedData.date,
                note: updatedData.note
            });
        } catch (error) {
            throw error;
        }
    }

    static async deleteTimeEntry(userId: string, timeEntryId: string): Promise<void> {
        try {
            const taskId = (await TimeEntryRepository.getTimeEntryById(timeEntryId))?.taskId || '';
            await TimeEntryService.validateUserAccess(userId, taskId);

            return await TimeEntryRepository.deleteTimeEntry(timeEntryId);
        } catch (error) {
            throw error;
        }
    }

    static async getTaskTimeEntries(userId: string, taskId: string): Promise<any[]> {
        try {

            await TimeEntryService.validateUserAccess(userId, taskId);

            return await TimeEntryRepository.getTaskTimeEntries(taskId);
        } catch (error) {
            throw error;
        }
    }

    private static async validateUserAccess(userId: string, taskId: string): Promise<void> {
        try {
            const task = await TaskRepository.getTaskById(taskId);
            if (!task) {
                throw new NotFoundException("Task not found.");
            }
            if (task.project?.userId !== userId) {
                throw new ForbiddenException("User does not have access to this task.");
            }
        } catch (error) {
            throw error;
        }
    }
}