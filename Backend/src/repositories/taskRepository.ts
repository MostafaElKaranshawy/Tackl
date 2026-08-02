import DBException from "../exceptions/dbException";
import NotFoundException from "../exceptions/notFoundException";
import Task from "../models/task";

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
            const task = await Task.findByPk(taskId);
            return task;
        } catch (error) {
            throw new DBException("Failed to retrieve task: " + (error as Error).message);
        }
    }
    
    static async updateTask(taskId: string, updatedData: Partial<Task>): Promise<Task | null> {
        try {
            const task = await Task.findByPk(taskId);
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
            const task = await Task.findByPk(taskId);
            if (!task) {
                throw new NotFoundException("Task not found.");
            }
            await task.destroy();
        } catch (error) {
            throw new DBException("Failed to delete task: " + (error as Error).message);
        }
    }

    static async getProjectTasks(projectId: string, page: number, limit: number, sortBy: string, sortOrder: string): Promise<{ tasks: Task[], total: number }> {
        try {
            const tasks = await Task.findAll({
                where: {
                    projectId: projectId
                },
                offset: (page - 1) * limit,
                limit: limit,
                order: [[sortBy, sortOrder]]
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
}