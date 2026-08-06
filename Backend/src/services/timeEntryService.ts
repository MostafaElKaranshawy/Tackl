import TimeEntryRepository from "../repositories/timeEntryRespository";
import TaskRepository from "../repositories/taskRepository";
import NotFoundException from "../exceptions/notFoundException";
import ForbiddenException from "../exceptions/forbiddenException";

export default class TimeEntryService {
    static async createTimeEntry(userId: string, timeEntryData: any): Promise<any> {
        try {

            await TimeEntryService.validateUserAccess(userId, timeEntryData.projectId, timeEntryData.taskId);

            return await TimeEntryRepository.createTimeEntry(timeEntryData.taskId, timeEntryData);
        } catch (error) {
            throw error;
        }
    }

    static async getTimeEntryById(timeEntryId: string, userId: string, projectId: string, taskId: string): Promise<any> {
        try {

            await TimeEntryService.validateUserAccess(userId, projectId, taskId);

            return await TimeEntryRepository.getTimeEntryById(timeEntryId);
        } catch (error) {
            console.error("Error in getTimeEntryById:", error);
            throw error;
        }
    }

    static async updateTimeEntry(userId: string, updatedData: any): Promise<any> {
        try {

            await TimeEntryService.validateUserAccess(userId, updatedData.projectId, updatedData.taskId);

            return await TimeEntryRepository.updateTimeEntry(updatedData.timeEntryId, {
                duration: updatedData.duration,
                date: updatedData.date,
                note: updatedData.note
            });
        } catch (error) {
            throw error;
        }
    }

    static async deleteTimeEntry(userId: string, projectId: string, taskId: string, timeEntryId: string): Promise<void> {
        try {
            const timeEntry = await TimeEntryRepository.getTimeEntryById(timeEntryId);
            if (!timeEntry) {
                throw new NotFoundException("Time entry not found.");
            }

            if(timeEntry.taskId !== taskId) {
                throw new ForbiddenException("Time entry does not belong to the specified task.");
            }
            await TimeEntryService.validateUserAccess(userId, projectId, taskId);

            return await TimeEntryRepository.deleteTimeEntry(timeEntryId);
        } catch (error) {
            throw error;
        }
    }

    static async getTaskTimeEntries(userId: string, projectId: string, taskId: string): Promise<any[]> {
        try {

            await TimeEntryService.validateUserAccess(userId, projectId, taskId);

            return await TimeEntryRepository.getTaskTimeEntries(taskId);
        } catch (error) {
            throw error;
        }
    }

    private static async validateUserAccess(userId: string, projectId: string, taskId: string): Promise<void> {
        try {
            const task = await TaskRepository.getTaskById(taskId);
            if (!task) {
                throw new NotFoundException("Task not found.");
            }
            if (task.projectId !== projectId) {
                throw new ForbiddenException("Task does not belong to the specified project.");
            }
            if (task.project?.userId !== userId) {
                throw new ForbiddenException("User does not have access to this task.");
            }
        } catch (error) {
            throw error;
        }
    }
}