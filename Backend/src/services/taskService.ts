import ForbiddenException from "../exceptions/forbiddenException";
import Task from "../models/task";
import TaskRepository from "../repositories/taskRepository";
import ProjectRepository from "../repositories/projectRepository";
import NotFoundException from "../exceptions/notFoundException";
import QueryParams from "../interfaces/QueryParams";

export default class TaskService {

    static async createTask(taskData: Partial<Task>, projectId: string, userId: string): Promise<Task> {
        const project = await ProjectRepository.getProjectById(projectId);
        if (!project) {
            throw new NotFoundException("Project not found.");
        }
        if (project.userId !== userId) {
            throw new ForbiddenException("Access denied");
        }

        return await TaskRepository.createTask(taskData, projectId);
    }

    static async getTaskById(projectId: string, taskId: string, userId: string): Promise<Task | null> {
        const task = await TaskRepository.getTaskById(userId, projectId, taskId);
        return task;
    }

    static async updateTask(projectId: string, taskId: string, updatedData: Partial<Task>, userId: string): Promise<Task | null> {
        return await TaskRepository.updateTask(userId, projectId, taskId, updatedData);
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
}