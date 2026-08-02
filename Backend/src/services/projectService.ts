import ForbiddenException from "../exceptions/forbiddenException";
import NotFoundException from "../exceptions/notFoundException";
import Project from "../models/project";
import ProjectRepository from "../repositories/projectRepository";
import UserRepository from "../repositories/userRepository";

export default class ProjectService {
    static async createProject(projectData: Project, userId: string) {
        try {
            const user = await UserRepository.getUserById(userId);
            if (!user) {
                throw new ForbiddenException("User not found");
            }
            return await ProjectRepository.createProject(projectData, userId);
        } catch (error) {
            throw error;
        }
    }

    static async getProjectById(projectId: string, userId: string) {
        try {
            const project = await ProjectRepository.getProjectById(projectId);
            const user = await UserRepository.getUserById(userId);
            if (!user) {
                throw new ForbiddenException("User not found");
            }
            if (!project) {
                throw new NotFoundException("Project not found.");
            }
            if (!user || project && project.userId !== userId) {
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

            const user = await UserRepository.getUserById(userId);
            if (!user) {
                throw new ForbiddenException("User not found");
            }
            if (!user || project && project.userId !== userId) {
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

            const user = await UserRepository.getUserById(userId);
            if (!user) {
                throw new ForbiddenException("User not found");
            }
            if (!user || project && project.userId !== userId) {
                throw new ForbiddenException("Access denied");
            }

            return await ProjectRepository.deleteProject(projectId);
        } catch (error) {
            throw error;
        }
    }

    static async getProjectsByUserId(userId: string, page: number, limit: number, sortBy: string, sortOrder: string) {
        try {
            const user = await UserRepository.getUserById(userId);
            if (!user) {
                throw new ForbiddenException("User not found");
            }
            return await ProjectRepository.getUserProjects(userId, page, limit, sortBy, sortOrder);
        } catch (error) {
            throw error;
        }
    }
}