import ForbiddenException from '../exceptions/forbiddenException';
import MissingRequiredDataException from '../exceptions/missingRequiredDataException';
import NotFoundException from '../exceptions/notFoundException';
import Task from '../models/task';
import TaskService from '../services/taskService'

export default class TaskController {
    
    static async createTask(req: any, res: any) {
        try {
            const userId = req.userId
            const taskData = req.body as Task;
            const projectId = req.params.projectId;
            console.log("Received task data:", taskData);
            console.log("Received project ID:", projectId);

            if (!taskData.title || !taskData.status || !taskData.priority) {
                throw new MissingRequiredDataException("Missing required task data.");
            }

            if (!projectId) {
                throw new MissingRequiredDataException("Project ID is required.");
            }
            const task = await TaskService.createTask(taskData, projectId, userId);
            res.status(201).json(task);
        } catch (error) {
            if (error instanceof ForbiddenException) {
                res.status(403).json({ message: error.message });
            } else if (error instanceof NotFoundException) {
                res.status(404).json({ message: error.message });
            } else if (error instanceof MissingRequiredDataException) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: (error as Error).message });
            }
        }

    }

    static async getTaskById(req: any, res: any) {
        try {
            const userId = req.userId;
            const taskId = req.params.taskId;
            if (!taskId) {
                throw new MissingRequiredDataException("Task ID is required.");
            }
            const task = await TaskService.getTaskById(taskId, userId);
            res.status(200).json(task);
        } catch (error) {
            if (error instanceof ForbiddenException) {
                res.status(403).json({ message: error.message });
            } else if (error instanceof NotFoundException) {
                res.status(404).json({ message: error.message });
            } else if (error instanceof MissingRequiredDataException) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: (error as Error).message });
            }
        }
    }

    static async updateTask(req: any, res: any) {
        try {
            const userId = req.userId;
            const taskId = req.params.taskId;
            const updatedData = req.body as Partial<Task>;

            if (!taskId) {
                throw new MissingRequiredDataException("Task ID is required.");
            }

            const task = await TaskService.updateTask(taskId, updatedData, userId);
            res.status(200).json(task);
        } catch (error) {
            if (error instanceof ForbiddenException) {
                res.status(403).json({ message: error.message });
            } else if (error instanceof NotFoundException) {
                res.status(404).json({ message: error.message });
            } else if (error instanceof MissingRequiredDataException) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: (error as Error).message });
            }
        }
    }

    static async deleteTask(req: any, res: any) {
        try {
            const userId = req.userId;
            const taskId = req.params.taskId;

            if (!taskId) {
                throw new MissingRequiredDataException("Task ID is required.");
            }

            await TaskService.deleteTask(taskId, userId);
            res.status(204).send();
        } catch (error) {
            if (error instanceof ForbiddenException) {
                res.status(403).json({ message: error.message });
            } else if (error instanceof NotFoundException) {
                res.status(404).json({ message: error.message });
            } else if (error instanceof MissingRequiredDataException) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: (error as Error).message });
            }
        }
    }

    static async getProjectTasks(req: any, res: any) {
        try {
            const userId = req.userId;
            const projectId = req.params.projectId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'createdAt';
            const sortOrder = (req.query.sortOrder as string) || 'asc';


            if (!projectId) {
                throw new MissingRequiredDataException("Project ID is required.");
            }

            const result = await TaskService.getProjectTasks(projectId, userId, page, limit, sortBy, sortOrder);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof ForbiddenException) {
                res.status(403).json({ message: error.message });
            } else if (error instanceof NotFoundException) {
                res.status(404).json({ message: error.message });
            } else if (error instanceof MissingRequiredDataException) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: (error as Error).message });
            }
        }
    }

    static async getAllProjectTasks(req: any, res: any) {
        try {
            const userId = req.userId;
            const projectId = req.params.projectId;
            const sortBy = (req.query.sortBy as string) || 'createdAt';
            const sortOrder = (req.query.sortOrder as string) || 'asc';

            if (!projectId) {
                throw new MissingRequiredDataException("Project ID is required.");
            }

            const tasks = await TaskService.getAllProjectTasks(projectId, userId, sortBy, sortOrder);
            res.status(200).json(tasks);
        } catch (error) {
            if (error instanceof ForbiddenException) {
                res.status(403).json({ message: error.message });
            } else if (error instanceof NotFoundException) {
                res.status(404).json({ message: error.message });
            } else if (error instanceof MissingRequiredDataException) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: (error as Error).message });
            }
        }
    }
}