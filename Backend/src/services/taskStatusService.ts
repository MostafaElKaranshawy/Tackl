import ForbiddenException from "../exceptions/forbiddenException";
import NotFoundException from "../exceptions/notFoundException";
import TaskStatus from "../models/taskStatus";
import TaskStatusRepository from "../repositories/taskStatusRepository";
import ProjectRepository from "../repositories/projectRepository";
import TaskService from "./taskService";
import { sequelize } from "../config/database";

export default class TaskStatusService {
    static async createTaskStatus(userId: string, projectId: string, taskStatusData: Partial<TaskStatus>): Promise<TaskStatus> {
        await this.checkProjectOwnership(userId, projectId);

        return await TaskStatusRepository.create(
            projectId,
            taskStatusData
        );
    }

    static async getTaskStatusByPK(userId: string, projectId: string, status: string): Promise<TaskStatus> {
        await this.checkProjectOwnership(userId, projectId);

        return await TaskStatusRepository.findByPK(
            projectId,
            status
        );
    }

    static async getTaskStatusesByProjectId(userId: string, projectId: string): Promise<TaskStatus[]> {
        await this.checkProjectOwnership(userId, projectId);

        return await TaskStatusRepository.findByProjectId(projectId);
    }

    static async updateTaskStatus(userId: string, projectId: string, status: string, taskStatusData: Partial<TaskStatus>): Promise<TaskStatus> {
        await this.checkProjectOwnership(userId, projectId);

        const taskStatus = await TaskStatusRepository.findByPK(
            projectId,
            status
        );

        const oldStatus = taskStatus.status;
        const newStatus =
            taskStatusData.status?.toLowerCase() ?? oldStatus;

        const updatedTaskStatus =
            await TaskStatusRepository.update(
                projectId,
                oldStatus,
                taskStatusData
            );

        if (newStatus !== oldStatus) {
            const tasks = await TaskService.getTaskByTaskStatus(
                projectId,
                oldStatus,
                userId
            );

            for (const task of tasks) {
                await TaskService.updateTask(
                    projectId,
                    task.id,
                    {
                        status: newStatus,
                    },
                    userId
                );
            }
        }

        return updatedTaskStatus;
    }

    static async deleteTaskStatus(userId: string, projectId: string, status: string): Promise<number> {
        await this.checkProjectOwnership(userId, projectId);

        const tasks = await TaskService.getTaskByTaskStatus(
            projectId,
            status,
            userId
        );

        return await sequelize.transaction(async (transaction) => {
            for (const task of tasks) {
                await TaskService.updateTask(
                    projectId,
                    task.id,
                    {
                        status: "to do",
                    },
                    userId,
                    transaction
                );
            }

            return await TaskStatusRepository.delete(
                projectId,
                status,
                transaction
            );
        });
    }

    private static async checkProjectOwnership(userId: string, projectId: string): Promise<void> {
        const project = await ProjectRepository.getProjectById(
            projectId
        );

        if (!project) {
            throw new NotFoundException("Project not found.");
        }

        if (project.userId !== userId) {
            throw new ForbiddenException(
                "User is not the owner of the project."
            );
        }
    }
}