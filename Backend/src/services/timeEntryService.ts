import TimeEntryRepository from "../repositories/timeEntryRespository";
import TaskRepository from "../repositories/taskRepository";
import NotFoundException from "../exceptions/notFoundException";
import ForbiddenException from "../exceptions/forbiddenException";
import TimeEntry from "../models/timeEntry";
import { ActionType } from "../enums/actionType";
import TaskHistoryRepository from "../repositories/taskHistoryRepository";
import { compareDates } from "../utils/dateTimeUtils";
import ChangeDTO from "../dto/changeDTO";
import { sequelize } from "../config/database";
export default class TimeEntryService {
    static async createTimeEntry(userId: string, projectId: string, taskId: string, timeEntryData: Partial<TimeEntry>): Promise<TimeEntry | null> {

        await TimeEntryService.validateUserAccess(userId, projectId, taskId);

        return await sequelize.transaction(async (transaction) => {
            const timeEntry = await TimeEntryRepository.createTimeEntry(taskId, timeEntryData, transaction);
            if (timeEntry) {
                const changes: ChangeDTO[] = Object.entries(timeEntryData)
                    .filter(([, value]) => value)
                    .map(([key, value]) => {
                        return {
                            fieldName: key,
                            oldValue: null,
                            newValue:
                                value != null
                                    ? String(value)
                                    : null,

                            actionType: ActionType.CREATED,
                        };
                    });

                if (changes.length > 0) {
                    await TaskHistoryRepository.createTaskHistory(
                        taskId,
                        userId,
                        ActionType.CREATED,
                        "Time Entry",
                        changes,
                        transaction
                    );
                }
            }
            return timeEntry;
        });

    }

    static async getTimeEntryById(timeEntryId: string, userId: string, projectId: string, taskId: string): Promise<TimeEntry | null> {
        await TimeEntryService.validateUserAccess(userId, projectId, taskId);

        return await TimeEntryRepository.getTimeEntryById(taskId, timeEntryId);
    }

    static async updateTimeEntry(
        userId: string,
        projectId: string,
        taskId: string,
        timeEntryId: string,
        updatedData: Partial<TimeEntry>
    ): Promise<TimeEntry | null> {

        await TimeEntryService.validateUserAccess(
            userId,
            projectId,
            taskId
        );

        // Get the existing entry BEFORE updating it
        const oldTimeEntry =
            await TimeEntryRepository.getTimeEntryById(taskId, timeEntryId);

        if (!oldTimeEntry) {
            throw new NotFoundException("Time entry not found.");
        }
        return await sequelize.transaction(async (transaction) => {
            const updatedTimeEntry =
                await TimeEntryRepository.updateTimeEntry(
                    taskId,
                    timeEntryId,
                    {
                        duration: updatedData.duration,
                        date: updatedData.date,
                        note: updatedData.note,
                    },
                    transaction
                );

            if (updatedTimeEntry) {
                const changes: ChangeDTO[] = Object.entries(updatedData)
                    .filter(([key, value]) => {
                        const oldValue =
                            oldTimeEntry[key as keyof TimeEntry];

                        if (key === "date" && oldValue && value) {
                            return !compareDates(
                                oldValue as Date,
                                value as Date
                            );
                        }

                        return oldValue !== value;
                    })
                    .map(([key, value]) => {
                        const oldValue =
                            oldTimeEntry[key as keyof TimeEntry];

                        return {
                            fieldName: key,

                            oldValue:
                                oldValue != null
                                    ? String(oldValue)
                                    : null,

                            newValue:
                                value != null
                                    ? String(value)
                                    : null,

                            actionType:
                                !value
                                    ? ActionType.DELETED
                                    : !oldValue
                                        ? ActionType.CREATED
                                        : ActionType.UPDATED,
                        };
                    });

                if (changes.length > 0) {
                    await TaskHistoryRepository.createTaskHistory(
                        taskId,
                        userId,
                        ActionType.UPDATED,
                        "Time Entry",
                        changes,
                        transaction
                    );
                }
            }

            return updatedTimeEntry;
        });
    }

    static async deleteTimeEntry(userId: string, projectId: string, taskId: string, timeEntryId: string): Promise<void> {

        await TimeEntryService.validateUserAccess(userId, projectId, taskId);
        const timeEntry = await TimeEntryRepository.getTimeEntryById(taskId, timeEntryId);
        if (!timeEntry) {
            throw new NotFoundException("Time entry not found.");
        }
        return await sequelize.transaction(async (transaction) => {
            await TimeEntryRepository.deleteTimeEntry(taskId, timeEntryId, transaction);

            const changes: ChangeDTO[] = (timeEntry) ?
                Object.entries(timeEntry)
                    .filter(([, oldValue]) => oldValue)
                    .filter(([key,]) => {
                        return (
                            String(key) === "date" ||
                            String(key) === "duration" ||
                            String(key) === "note"
                        );
                    })
                    .map(([fieldName, oldValue]) => ({
                        fieldName,
                        oldValue: oldValue !== undefined ? String(oldValue) : null,
                        newValue: null,
                        actionType: ActionType.DELETED
                    })) : [];

            await TaskHistoryRepository.createTaskHistory(
                taskId,
                userId,
                ActionType.DELETED,
                "Time Entry",
                changes,
                transaction
            );
        });
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