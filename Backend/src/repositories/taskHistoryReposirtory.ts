import TaskHistory from "../models/taskHistory";
import TaskChange from "../models/taskChange";
import DBException from "../exceptions/dbException";
import ChangeDTO from "../dto/changeDTO";
import { ActionType } from "../enums/actionType";

export default class TaskHistoryRepository {
    static async createTaskHistory(taskId: string, userId: string, actionType: ActionType, changes: ChangeDTO[]): Promise<TaskHistory> {
        try {
            if (!taskId || !userId || !actionType || !changes || changes.length === 0) {
                throw new Error("Missing required data for creating task history.");
            }
            const taskHistory = await TaskHistory.create({
                taskId,
                userId,
                actionType,
                
            });

            for (const change of changes) {
                await TaskChange.create({
                    taskHistoryId: taskHistory.id,
                    fieldName: change.fieldName,
                    oldValue: change.oldValue,
                    newValue: change.newValue,
                    actionType: change.actionType,
                });
            }

            return taskHistory;

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