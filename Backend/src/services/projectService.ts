import ForbiddenException from "../exceptions/forbiddenException";
import NotFoundException from "../exceptions/notFoundException";
import Project from "../models/project";
import ProjectRepository from "../repositories/projectRepository";
import TaskStatusRepository from "../repositories/taskStatusRepository";
import { sequelize } from "../config/database";
export default class ProjectService {
    static async createProject(projectData: Partial<Project>, userId: string) {
        await sequelize.transaction(async (transaction) => {
            const createdProject = await ProjectRepository.createProject(projectData, userId, transaction);

            // Create default task statuses for the new project
            const defaultTaskStatuses = [
                { status: "to do", order: 1 },
                { status: "in progress", order: 2 },
                { status: "done", order: 3 },
            ];

            for (const taskStatus of defaultTaskStatuses) {
                await TaskStatusRepository.create(
                    createdProject.id,
                    {
                        ...taskStatus,
                    },
                    transaction
                );
            }
        });
    }

    static async getProjectById(projectId: string, userId: string) {
        const project = await ProjectRepository.getProjectById(projectId);
        if (!project) {
            throw new NotFoundException("Project not found.");
        }
        if (project && project.userId !== userId) {
            throw new ForbiddenException("Access denied");
        }

        return project;
    }

    static async updateProject(projectId: string, updatedData: Partial<Project>, userId: string) {
        const project = await ProjectRepository.getProjectById(projectId);
        if (!project) {
            throw new NotFoundException("Project not found.");
        }

        if (project && project.userId !== userId) {
            throw new ForbiddenException("Access denied");
        }

        return await ProjectRepository.updateProject(projectId, updatedData);
    }

    static async deleteProject(projectId: string, userId: string) {
        const project = await ProjectRepository.getProjectById(projectId);
        if (!project) {
            throw new NotFoundException("Project not found.");
        }

        if (project && project.userId !== userId) {
            throw new ForbiddenException("Access denied");
        }

        return await ProjectRepository.deleteProject(projectId);
    }

    static async getProjectsByUserId(userId: string, page: number, limit: number, sortBy: string, sortOrder: string) {
        return await ProjectRepository.getUserProjects(userId, page, limit, sortBy, sortOrder);
    }
}