import ForbiddenException from "../exceptions/forbiddenException";
import NotFoundException from "../exceptions/notFoundException";
import ProjectRepository from "../repositories/projectRepository";

export default class ProjectService {
    static async createProject(projectData: any, userId: string) {
        try {
            return await ProjectRepository.createProject(projectData, userId);
        } catch (error) {
            throw error;
        }
    }

    static async getProjectById(projectId: string, userId: string) {
        try {
            const project = await ProjectRepository.getProjectById(projectId);
            if (!project) {
                throw new NotFoundException("Project not found.");
            }
            if (project && project.userId !== userId) {
                throw new ForbiddenException("Access denied");
            }

            return project;
        } catch (error) {
            throw error;
        }
    }

    static async updateProject(projectId: string, updatedData: any, userId: string) {
        try {
            const project = await ProjectRepository.getProjectById(projectId);
            if (!project) {
                throw new NotFoundException("Project not found.");
            }

            if (project && project.userId !== userId) {
                throw new ForbiddenException("Access denied");
            }

            return await ProjectRepository.updateProject(projectId, updatedData);
        } catch (error) {
            throw error;
        }
    }

    static async deleteProject(projectId: string, userId: string) {
        try {
            const project = await ProjectRepository.getProjectById(projectId);
            if (!project) {
                throw new NotFoundException("Project not found.");
            }

            if (project && project.userId !== userId) {
                throw new ForbiddenException("Access denied");
            }

            return await ProjectRepository.deleteProject(projectId);
        } catch (error) {
            throw error;
        }
    }

    static async getProjectsByUserId(userId: string, page: number, limit: number, sortBy: string, sortOrder: string) {
        try {
            return await ProjectRepository.getUserProjects(userId, page, limit, sortBy, sortOrder);
        } catch (error) {
            throw error;
        }
    }
}