import { FindOptions } from "sequelize";
import { Op } from "../config/database";
import DBException from "../exceptions/dbException";
import NotFoundException from "../exceptions/notFoundException";
import QueryParams from "../interfaces/QueryParams";
import Task from "../models/task";
import Project from "../models/project";

export default class TaskRepository {
    static async createTask(taskData: Task, projectId: string): Promise<Task> {
        try {
            const task = await Task.create({
                ...taskData,
                projectId,
            });
            return task;
        } catch (error) {
            throw new DBException("Failed to create task: " + (error as Error).message);
        }
    }

    static async getTaskById(taskId: string): Promise<Task | null> {
        try {
            const task = await Task.findByPk(taskId,
                {
                    include: [
                        {
                            model: Project,
                            as: "project",
                            attributes: ["userId"],
                        },
                    ],
                }
            );
            return task;
        } catch (error) {
            throw new DBException("Failed to retrieve task: " + (error as Error).message);
        }
    }

    static async updateTask(taskId: string, updatedData: Partial<Task>): Promise<Task | null> {
        try {
            const task = await TaskRepository.getTaskById(taskId);
            if (!task) {
                throw new NotFoundException("Task not found.");
            }
            await task.update(updatedData);
            return task;
        } catch (error) {
            throw new DBException("Failed to update task: " + (error as Error).message);
        }
    }

    static async deleteTask(taskId: string): Promise<void> {
        try {
            const task = await TaskRepository.getTaskById(taskId);
            if (!task) {
                throw new NotFoundException("Task not found.");
            }
            await task.destroy();
        } catch (error) {
            throw new DBException("Failed to delete task: " + (error as Error).message);
        }
    }

    static async getProjectTasks(projectId: string, queryParams: QueryParams): Promise<{ tasks: Task[], total: number }> {
        try {
            const page = queryParams.page;
            const limit = queryParams.limit;
            const sortBy = queryParams.sortBy || 'createdAt';
            const sortOrder = queryParams.sortOrder || 'ASC';

            const where = {
                projectId,
                ...(queryParams.search && {
                    [Op.or]: [
                        {
                            title: {
                                [Op.iLike]: `%${queryParams.search}%`,
                            },
                        },
                        {
                            description: {
                                [Op.iLike]: `%${queryParams.search}%`,
                            },
                        },
                    ],
                }),
                ...(queryParams.filterStatus && {
                    status: queryParams.filterStatus,
                }),
                ...(queryParams.filterPriority && {
                    priority: queryParams.filterPriority,
                }),
                ...(queryParams.filterOverDue && {
                    dueDate:
                        queryParams.filterOverDue
                            ? { [Op.lt]: new Date() }
                            : { [Op.gte]: new Date() },
                }),
            };

            const findOptions: FindOptions = {
                where,
                order: [[sortBy, sortOrder]],
            };

            if (page !== undefined && limit !== undefined) {
                findOptions.offset = (page - 1) * limit;
                findOptions.limit = limit;
            }
            const tasks = await Task.findAll({
                ...findOptions,
            });

            const total = await Task.count({ where: { projectId } });
            return { tasks, total };
        } catch (error) {
            throw new DBException("Failed to retrieve tasks: " + (error as Error).message);
        }
    }

    static async getAllProjectTasks(projectId: string, sortBy: string, sortOrder: string): Promise<Task[]> {
        try {
            const tasks = await Task.findAll({
                where: {
                    projectId: projectId
                },
                order: [[sortBy, sortOrder]]
            });
            return tasks;
        } catch (error) {
            throw new DBException("Failed to retrieve tasks: " + (error as Error).message);
        }
    }

    static async getTaskProjectId(taskId: string): Promise<string | null> {
        try {
            const task = await Task.findByPk(taskId, {
                attributes: ['projectId'],
            });
            if (!task) {
                throw new NotFoundException("Task not found.");
            }
            return task.projectId;
        } catch (error) {
            throw new DBException("Failed to retrieve task project ID: " + (error as Error).message);
        }
    }

    static async getTaskUserId(taskId: string): Promise<string | null> {
        try {
            const task = await Task.findByPk(taskId, {
                include: [
                    {
                        model: Project,
                        as: "project",
                        attributes: ["userId"],
                    },
                ],
            });

            const userId = task?.project?.userId;
            if (!userId) {
                throw new NotFoundException("Task not found.");
            }
            return userId;
        } catch (error) {
            throw new DBException("Failed to retrieve task user ID: " + (error as Error).message);
        }
    }
}