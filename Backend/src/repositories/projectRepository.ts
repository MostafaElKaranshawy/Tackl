import DBException from "../exceptions/dbException";
import ForbiddenException from "../exceptions/forbiddenException";
import NotFoundException from "../exceptions/notFoundException";
import Project from "../models/project";

export default class ProjectRepo {
    static async createProject(projectData: Project, userId: string): Promise<Project> {
        try {
            const project = await Project.create({
                ...projectData,
                userId,
            });
            return project;
        } catch (error) {
            throw new DBException("Failed to create project: " + (error as Error).message);
        }
    }
    static async getProjectById(projectId: string): Promise<Project | null> {
        try {
            const project = await Project.findByPk(projectId);
            return project;
        } catch (error) {
            throw new DBException("Failed to retrieve project: " + (error as Error).message);
        }
    }

    static async updateProject(projectId: string, updatedData: Partial<Project>): Promise<Project | null> {
        try {
            const project = await Project.findByPk(projectId);
            if (!project) {
                throw new NotFoundException("Project not found.");
            }

            await project.update(updatedData);
            return project;
        } catch (error) {
            throw new DBException("Failed to update project: " + (error as Error).message);
        }
    }

    static async deleteProject(projectId: string): Promise<void> {
        try {
            const project = await Project.findByPk(projectId);
            if (!project) {
                throw new NotFoundException("Project not found.");
            }
            await project.destroy();
        } catch (error) {
            throw new DBException("Failed to delete project: " + (error as Error).message);
        }
    }

    static async getUserProjects(userId: string, page: number, limit: number, sortBy: string, sortOrder: string): Promise<{ projects: Project[], total: number }> {
        try {
            const projects = await Project.findAll({
                where: {
                    userId: userId
                },
                offset: (page - 1) * limit,
                limit: limit,
                order: [[sortBy, sortOrder]]
            }); 
            const total = await Project.count({
                where: {
                    userId: userId
                }
            });
            return { projects, total };
        } catch (error) {
            throw new DBException("Failed to retrieve user projects: " + (error as Error).message);
        }
    }
}