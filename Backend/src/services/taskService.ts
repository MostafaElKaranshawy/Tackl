import ForbiddenException from "../exceptions/forbiddenException";
import Task from "../models/task";
import TaskRepository from "../repositories/taskRepository";
import ProjectRepository from "../repositories/projectRepository";
import NotFoundException from "../exceptions/notFoundException";
import QueryParams from "../interfaces/QueryParams";
import ChangeDTO from "../dto/changeDTO";
import { ActionType } from "../enums/actionType";
import TaskHistoryRepository from "../repositories/taskHistoryRepository";
import { compareDates } from "../utils/dateTimeUtils";
import { sequelize } from "../config/database";

export default class TaskService {

    static async createTask(taskData: Partial<Task>, projectId: string, userId: string): Promise<Task> {
        const project = await ProjectRepository.getProjectById(projectId);
        if (!project) {
            throw new NotFoundException("Project not found.");
        }
        if (project.userId !== userId) {
            throw new ForbiddenException("Access denied");
        }
        return await sequelize.transaction(async (transaction) => {
            const task = await TaskRepository.createTask(taskData, projectId, transaction);
            if (task) {
                const changes: ChangeDTO[] = Object.entries(taskData)
                    .filter(([key, value]) => {
                        return String(key) == "title" || String(key) == "description" || String(key) == "status" || String(key) == "priority" || String(key) == "estimatedTime" || String(key) == "dueDate";
                    })
                    .map(
                        ([key, value]) => ({
                            fieldName: key,
                            oldValue: null,
                            newValue: value ? String(value) : null,
                            actionType: ActionType.CREATED,
                        })
                    );

                if (changes.length > 0) {
                    await TaskHistoryRepository.createTaskHistory(
                        task.id,
                        userId,
                        ActionType.CREATED,
                        "Task",
                        changes,
                        transaction
                    );
                }
            }
            return task;
        });
    }

    static async getTaskById(projectId: string, taskId: string, userId: string): Promise<Task | null> {
        const task = await TaskRepository.getTaskById(userId, projectId, taskId);
        return task;
    }

    static async updateTask(projectId: string, taskId: string, updatedData: Partial<Task>, userId: string): Promise<Task | null> {
        const oldTask = await TaskRepository.getTaskById(userId, projectId, taskId);

        if (!oldTask) {
            throw new NotFoundException("Task not found.");
        }

        return await sequelize.transaction(async (transaction) => {
            const updatedTask = await TaskRepository.updateTask(userId, projectId, taskId, updatedData, transaction);

            if (updatedTask) {
                const changes: ChangeDTO[] = Object.entries(updatedData)
                    .filter(([key, value]) => {
                        const oldValue = oldTask[key as keyof Task];
                        if (key === "dueDate" && oldValue && value) {
                            return !compareDates(oldValue as Date, value as Date);
                        }
                        return oldValue !== value;
                    }).filter(([key, value]) => {
                        return String(key) == "title" || String(key) == "description" || String(key) == "status" || String(key) == "priority" || String(key) == "estimatedTime" || String(key) == "dueDate";
                    }).map(([key, value]) => {
                        const oldValue = oldTask[key as keyof Task];

                        return {
                            fieldName: key,
                            oldValue: oldValue ? String(oldValue) : null,
                            newValue: value ? String(value) : null,
                            actionType: !value
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
                        "Task",
                        changes,
                        transaction
                    );
                }
            }
            return updatedTask;
        });
    }

    static async deleteTask(projectId: string, taskId: string, userId: string): Promise<void> {
        await TaskRepository.deleteTask(userId, projectId, taskId);
    }

    static async getProjectTasks(projectId: string, userId: string, queryParams: QueryParams): Promise<{ tasks: Task[], total: number }> {
        const project = await ProjectRepository.getProjectById(projectId);
        if (!project) {
            throw new NotFoundException("Project not found.");
        }
        if (project.userId !== userId) {
            throw new ForbiddenException("Access denied");
        }

        const { tasks, total } = await TaskRepository.getProjectTasks(projectId, queryParams);
        return { tasks, total };
    }

    static async getAllProjectTasks(projectId: string, userId: string, sortBy: string, sortOrder: string): Promise<Task[]> {
        const project = await ProjectRepository.getProjectById(projectId);
        if (!project) {
            throw new NotFoundException("Project not found.");
        }
        if (project.userId !== userId) {
            throw new ForbiddenException("Access denied");
        }

        return await TaskRepository.getAllProjectTasks(projectId, sortBy, sortOrder);
    }

    static async getTaskByColumnId(projectId: string, columnId: string, userId: string): Promise<Task[]> {
        const project = await ProjectRepository.getProjectById(projectId);
        if (!project) {
            throw new NotFoundException("Project not found.");
        }
        if (project.userId !== userId) {
            throw new ForbiddenException("Access denied");
        }

        return await TaskRepository.getTaskByColumnId(projectId, columnId);
    }
}