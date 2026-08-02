import ForbiddenException from "../exceptions/forbiddenException";
import Task from "../models/task";
import TaskRepository from "../repositories/taskRepository";
import UserRepository from "../repositories/userRepository";
import ProjectRepository from "../repositories/projectRepository";
import NotFoundException from "../exceptions/notFoundException";

export default class TaskService {

    static async createTask(taskData: Task, projectId: string, userId: string): Promise<Task> {

        try {
            const user = await UserRepository.getUserById(userId);
            if (!user) {
                throw new ForbiddenException("User not found");
            }
            
            const project = await ProjectRepository.getProjectById(projectId);
            if (!project) {
                throw new NotFoundException("Project not found.");
            }
            if (project.userId !== userId) {
                throw new ForbiddenException("Access denied");
            }

            return await TaskRepository.createTask(taskData, projectId);
        } catch (error) {
            throw error;
        }
    }

    static async getTaskById(taskId: string, userId: string): Promise<Task | null> {
        try {
            const task = await TaskRepository.getTaskById(taskId);
            if (!task) {
                throw new NotFoundException("Task not found.");
            }

            const project = await ProjectRepository.getProjectById(task.projectId);
            if (!project) {
                throw new NotFoundException("Project not found.");
            }
            if (project.userId !== userId) {
                throw new ForbiddenException("Access denied");
            }

            return task;
        } catch (error) {
            throw error;
        }
    }

    static async updateTask(taskId: string, updatedData: Partial<Task>, userId: string): Promise<Task | null> {
        try {
            const task = await TaskRepository.getTaskById(taskId);
            if (!task) {
                throw new NotFoundException("Task not found.");
            }

            const project = await ProjectRepository.getProjectById(task.projectId);
            if (!project) {
                throw new NotFoundException("Project not found.");
            }
            if (project.userId !== userId) {
                throw new ForbiddenException("Access denied");
            }

            return await TaskRepository.updateTask(taskId, updatedData);
        } catch (error) {
            throw error;
        }
    }

    static async deleteTask(taskId: string, userId: string): Promise<void> {
        try {
            const task = await TaskRepository.getTaskById(taskId);
            if (!task) {
                throw new NotFoundException("Task not found.");
            }

            const project = await ProjectRepository.getProjectById(task.projectId);
            if (!project) {
                throw new NotFoundException("Project not found.");
            }
            if (project.userId !== userId) {
                throw new ForbiddenException("Access denied");
            }

            await TaskRepository.deleteTask(taskId);
        } catch (error) {
            throw error;
        }
    }

    static async getProjectTasks(projectId: string, userId: string, page: number, limit: number, sortBy: string, sortOrder: string): Promise<{ tasks: Task[], total: number }> {
        try {
            const project = await ProjectRepository.getProjectById(projectId);
            if (!project) {
                throw new NotFoundException("Project not found.");
            }
            if (project.userId !== userId) {
                throw new ForbiddenException("Access denied");
            }

            return await TaskRepository.getProjectTasks(projectId, page, limit, sortBy, sortOrder);
        } catch (error) {
            throw error;
        }
    }

    static async getAllProjectTasks(projectId: string, userId: string, sortBy: string, sortOrder: string): Promise<Task[]> {
        try {
            const project = await ProjectRepository.getProjectById(projectId);
            if (!project) {
                throw new NotFoundException("Project not found.");
            }
            if (project.userId !== userId) {
                throw new ForbiddenException("Access denied");
            }

            return await TaskRepository.getAllProjectTasks(projectId, sortBy, sortOrder);
        } catch (error) {
            throw error;
        }
    }
}