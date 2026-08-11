import ForbiddenException from "../exceptions/forbiddenException";
import MissingRequiredDataException from "../exceptions/missingRequiredDataException";
import TaskHistoryService from "../services/taskHistoryService";
import { Request, Response, NextFunction } from "express";

export default class TaskHistoryController {
    static async getTaskHistory(req: Request, res: Response, next: NextFunction) {
        const userId = req.userId;

        if (!userId) {
            throw new ForbiddenException("User ID is required.");
        }

        const projectId = req.params.projectId;
        if (!projectId || !(projectId && typeof projectId === 'string')) {
            throw new MissingRequiredDataException("Project ID is required.");
        }

        const taskId = req.params.taskId;
        if (!taskId || !(taskId && typeof taskId === 'string')) {
            throw new MissingRequiredDataException("Task ID is required.");
        }

        try {
            const taskHistory = await TaskHistoryService.getTaskHistory(userId, projectId, taskId);
            res.status(200).json(taskHistory);
        } catch (error) {
            next(error);
        }
    }
}
