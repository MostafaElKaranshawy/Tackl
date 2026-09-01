import { NextFunction, Request, Response } from "express";
import ForbiddenException from "../exceptions/forbiddenException";
import MissingRequiredDataException from "../exceptions/missingRequiredDataException";
import TaskStatusService from "../services/taskStatusService";
import { MainTaskStatus } from "../enums/mainTaskStatus";

export default class TaskStatusController {
    static async createTaskStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;
            const { projectId } = req.params;
            const taskStatusData = req.body;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            if (!projectId || typeof projectId !== "string") {
                throw new MissingRequiredDataException(
                    "Project ID is required."
                );
            }

            if (!taskStatusData || typeof taskStatusData !== "object") {
                throw new MissingRequiredDataException(
                    "Request body is required."
                );
            }

            if (!taskStatusData.status) {
                throw new MissingRequiredDataException(
                    "Task status is required."
                );
            }

            const taskStatus =
                await TaskStatusService.createTaskStatus(
                    userId,
                    projectId,
                    {
                        status: taskStatusData.status,
                    }
                );

            res.status(201).json(taskStatus);
        } catch (error) {
            next(error);
        }
    }

    static async getTaskStatusById(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;
            const { projectId, taskStatusId } = req.params;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            if (!projectId || typeof projectId !== "string") {
                throw new MissingRequiredDataException(
                    "Project ID is required."
                );
            }

            if (!taskStatusId || typeof taskStatusId !== "string") {
                throw new MissingRequiredDataException(
                    "Task status ID is required."
                );
            }

            const taskStatus =
                await TaskStatusService.getTaskStatusByPK(
                    userId,
                    projectId,
                    taskStatusId
                );

            res.status(200).json(taskStatus);
        } catch (error) {
            next(error);
        }
    }

    static async getTaskStatusesByProjectId(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;
            const { projectId } = req.params;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            if (!projectId || typeof projectId !== "string") {
                throw new MissingRequiredDataException(
                    "Project ID is required."
                );
            }

            const taskStatuses =
                await TaskStatusService.getTaskStatusesByProjectId(
                    userId,
                    projectId
                );

            res.status(200).json(taskStatuses);
        } catch (error) {
            next(error);
        }
    }

    static async updateTaskStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;
            const { projectId, taskStatusId } = req.params;
            const updatedData = req.body;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            if (!projectId || typeof projectId !== "string") {
                throw new MissingRequiredDataException(
                    "Project ID is required."
                );
            }

            if (!taskStatusId || typeof taskStatusId !== "string") {
                throw new MissingRequiredDataException(
                    "Task status ID is required."
                );
            }

            if (
                updatedData?.status === undefined &&
                updatedData?.order === undefined
            ) {
                throw new MissingRequiredDataException(
                    "At least one field (status, or order) must be provided for update."
                );
            }

            const taskStatus =
                await TaskStatusService.updateTaskStatus(
                    userId,
                    projectId,
                    taskStatusId,
                    {
                        status: updatedData.status,
                        order: updatedData.order,
                    }
                );

            res.status(200).json(taskStatus);
        } catch (error) {
            next(error);
        }
    }

    static async deleteTaskStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;
            const { projectId, taskStatusId } = req.params;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            if (!projectId || typeof projectId !== "string") {
                throw new MissingRequiredDataException(
                    "Project ID is required."
                );
            }

            if (!taskStatusId || typeof taskStatusId !== "string") {
                throw new MissingRequiredDataException(
                    "Task status ID is required."
                );
            }

            await TaskStatusService.deleteTaskStatus(
                userId,
                projectId,
                taskStatusId
            );

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}