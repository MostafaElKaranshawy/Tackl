import { Transaction } from "sequelize";
import DBException from "../exceptions/dbException";
import MissingRequiredDataException from "../exceptions/missingRequiredDataException";
import NotFoundException from "../exceptions/notFoundException";
import Project from "../models/project";

export default class ProjectRepository {
    static async createProject(projectData: Partial<Project>, userId: string, transaction?: Transaction): Promise<Project> {
        try {
            if (!projectData.name) {
                throw new MissingRequiredDataException("Project name is required.");
            }

            if (transaction) {
                const project = await Project.create({
                    name: projectData.name,
                    ...(projectData.description !== undefined && {
                        description: projectData.description,
                    }),
                    userId,
                }, { transaction });
                return project;
            } else {
                const project = await Project.create({
                    name: projectData.name,
                    ...(projectData.description !== undefined && {
                        description: projectData.description,
                    }),
                    userId,
                });
                return project;
            }
        } catch (error) {
            const message = error instanceof Error
                ? error.message
                : "Unknown database error";

            throw new DBException(`Failed to create project: ${message}`);
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
            if (error instanceof NotFoundException) {
                throw error;
            }
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
            if (error instanceof NotFoundException) {
                throw error;
            }
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

    static async getProjectUserId(projectId: string): Promise<string> {
        const userId = (
            await Project.findByPk(projectId, {
                attributes: ["userId"],
            })
        )?.userId;

        if (!userId) {
            throw new NotFoundException("Project not found.");
        }

        return userId;
    }
}