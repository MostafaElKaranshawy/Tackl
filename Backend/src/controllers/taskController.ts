import ForbiddenException from '../exceptions/forbiddenException';
import MissingRequiredDataException from '../exceptions/missingRequiredDataException';
import QueryParams from '../interfaces/QueryParams';
import Task from '../models/task';
import TaskService from '../services/taskService'
import { checkQueryParams } from '../utils/checkQueryParams';
import { NextFunction, Request, Response } from 'express';

export default class TaskController {

    static async createTask(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.userId
            const taskData = req.body as Task;
            const projectId = req.params.projectId;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            if (!taskData.title) {
                throw new MissingRequiredDataException("Missing required task data.");
            }

            if (!projectId || !(projectId && typeof projectId === 'string')) {
                throw new MissingRequiredDataException("Project ID is required.");
            }
            const parsedTaskData = {
                title: taskData.title,
                description: taskData.description || null,
                status: taskData.status || "todo",
                priority: taskData.priority || "medium",
                estimatedTime: taskData.estimatedTime || null,
                dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
            };
            const task = await TaskService.createTask(parsedTaskData, projectId, userId);
            res.status(201).json(task);
        } catch (error) {
            next(error);
        }

    }

    static async getTaskById(req: Request, res: Response, next: NextFunction) {
        try {
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
            const task = await TaskService.getTaskById(projectId, taskId, userId);
            res.status(200).json(task);
        } catch (error) {
            next(error);
        }
    }

    static async updateTask(req: Request, res: Response, next: NextFunction) {
        try {
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
            const updatedData = req.body as Partial<Task>;

            const parsedTaskData = {
                ...(updatedData.title !== undefined && { title: updatedData.title }),
                ...(updatedData.description !== undefined && { description: updatedData.description }),
                ...(updatedData.status !== undefined && { status: updatedData.status }),
                ...(updatedData.priority !== undefined && { priority: updatedData.priority }),
                ...(updatedData.estimatedTime !== undefined && { estimatedTime: updatedData.estimatedTime }),
                ...(updatedData.dueDate !== undefined && {
                    dueDate: updatedData.dueDate ? new Date(updatedData.dueDate) : null,
                }),
            };

            const task = await TaskService.updateTask(projectId, taskId, parsedTaskData, userId);
            res.status(200).json(task);
        } catch (error) {
            next(error);
        }
    }

    static async deleteTask(req: Request, res: Response, next: NextFunction) {
        try {
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

            await TaskService.deleteTask(projectId, taskId, userId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    static async getProjectTasks(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            const projectId = req.params.projectId;

            if (!projectId || !(projectId && typeof projectId === 'string')) {
                throw new MissingRequiredDataException("Project ID is required.");
            }

            const page = parseInt(req.query.page as string) || undefined;
            const limit = parseInt(req.query.limit as string) || undefined;
            const sortBy = (req.query.sortBy as string) || 'createdAt';
            const sortOrder = (req.query.sortOrder as string) || 'asc';

            // search and filter
            const search = req.query.search as string | undefined;
            const filterStatus = req.query.status as string | undefined;
            const filterPriority = req.query.priority as string | undefined;
            const filterOverDue = req.query.overdue === 'true' ? true : req.query.overdue === 'false' ? false : undefined;

            const queryParams: QueryParams = {
                page,
                limit,
                sortBy,
                sortOrder,
                search,
                filterStatus,
                filterPriority,
                filterOverDue
            };

            checkQueryParams(queryParams);

            const result = await TaskService.getProjectTasks(projectId, userId, queryParams);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async getAllProjectTasks(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            const projectId = req.params.projectId;
            const sortBy = (req.query.sortBy as string) || 'createdAt';
            const sortOrder = (req.query.sortOrder as string) || 'asc';

            if (!projectId || !(projectId && typeof projectId === 'string')) {
                throw new MissingRequiredDataException("Project ID is required.");
            }

            if (["createdAt", "updatedAt", "title", "dueDate", "priority"].indexOf(sortBy) === -1) {
                throw new MissingRequiredDataException("Invalid sortBy value. Must be one of: createdAt, updatedAt, title, dueDate, priority.");
            }

            if (["asc", "desc"].indexOf(sortOrder) === -1) {
                throw new MissingRequiredDataException("Invalid sortOrder value. Must be 'asc' or 'desc'.");
            }
            const tasks = await TaskService.getAllProjectTasks(projectId, userId, sortBy, sortOrder);
            res.status(200).json(tasks);
        } catch (error) {
            next(error);
        }
    }
}