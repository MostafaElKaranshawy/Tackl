import TaskHistory from "../models/taskHistory";
import TaskChange from "../models/taskChange";
import DBException from "../exceptions/dbException";
import ChangeDTO from "../dto/changeDTO";
import { ActionType } from "../enums/actionType";

export default class TaskHistoryRepository {
    static async createTaskHistory(taskId: string, userId: string, actionType: ActionType, fieldName: string, changes: ChangeDTO[]): Promise<void> {
        try {
            if (!taskId || !userId || !actionType || !fieldName) {
                throw new Error("Missing required data for creating task history.");
            }
            if (changes && changes.length > 0 && !changes.some((c) => c.oldValue !== c.newValue)) return;
            const taskHistory = await TaskHistory.create({
                taskId,
                userId,
                actionType,
                fieldName: fieldName
            });

            if (!changes || changes.length === 0) return;

            for (const change of changes) {
                if (!change.fieldName || change.oldValue === change.newValue || !change.actionType) continue;
                await TaskChange.create({
                    taskHistoryId: taskHistory.id,
                    fieldName: change.fieldName,
                    oldValue: change.oldValue,
                    newValue: change.newValue,
                    actionType: change.actionType,
                });
            }

        } catch (error) {
            throw new DBException("Failed to create task history: " + (error as Error).message);
        }
    }

    static async getTaskHistoryByTaskId(taskId: string): Promise<TaskHistory[]> {
        try {
            if (!taskId) {
                throw new Error("Task ID is required to fetch task history.");
            }
            const taskHistories = await TaskHistory.findAll({
                where: { taskId },
                include: [
                    { model: TaskChange, as: "taskChanges" },
                ],
                order: [["createdAt", "DESC"]],
            });
            return taskHistories;
        } catch (error) {
            throw new DBException("Failed to fetch task history: " + (error as Error).message);
        }
    }
}