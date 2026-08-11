import MissingRequiredDataException from "../exceptions/missingRequiredDataException";
import ProjectService from "../services/projectService";
import { NextFunction, Request, Response } from "express";
import ForbiddenException from "../exceptions/forbiddenException";
export default class ProjectController {
    static async createProject(req: Request, res: Response, next: NextFunction) {
        try {

            const userId = req.userId;
            const projectData = req.body;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }
            if (projectData && !projectData.name) {
                throw new MissingRequiredDataException("Missing required project data.");
            }

            const project = await ProjectService.createProject({ name: projectData.name, description: projectData.description || null }, userId);

            res.status(201).json(project);
        } catch (error) {
            if (error instanceof MissingRequiredDataException) {
                res.status(400).json({ message: error.message });
            } else {
                next(error);
            }
        }
    }

    static async getProjectById(req: Request, res: Response, next: NextFunction) {
        try {

            const userId = req.userId;
            const { projectId } = req.params;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            if (!projectId || !(projectId && typeof projectId === 'string')) {
                throw new MissingRequiredDataException("Project ID is required.");
            }

            const project = await ProjectService.getProjectById(projectId, userId);

            res.status(200).json(project);

        } catch (error) {
            next(error);
        }
    }

    static async updateProject(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;
            const projectId = req.params.projectId;
            const updatedData = req.body;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            if (!projectId || !(projectId && typeof projectId === 'string')) {
                throw new MissingRequiredDataException("Project ID is required.");
            }

            if (!updatedData.name && !updatedData.description) {
                throw new MissingRequiredDataException("At least one field (name or description) must be provided for update.");
            }

            const project = await ProjectService.updateProject(projectId, { name: updatedData.name, description: updatedData.description }, userId);
            res.status(200).json(project);
        } catch (error) {
            next(error);
        }
    }

    static async deleteProject(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;
            const projectId = req.params.projectId;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            if (!projectId || !(projectId && typeof projectId === 'string')) {
                throw new MissingRequiredDataException("Project ID is required.");
            }
            await ProjectService.deleteProject(projectId, userId);

            res.status(204).send();

        } catch (error) {
            next(error);
        }
    }

    static async getUserProjects(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            const page = req.query.page !== undefined
                ? parseInt(req.query.page as string)
                : 1;

            if (page < 1) {
                throw new MissingRequiredDataException(
                    "Page number must be greater than 0."
                );
            }

            const limit = req.query.limit !== undefined
                ? parseInt(req.query.limit as string)
                : 10;

            if (limit < 1) {
                throw new MissingRequiredDataException(
                    "Limit must be greater than 0."
                );
            }

            const sortBy = (req.query.sortBy as string) || "createdAt";

            if (!["name", "createdAt", "updatedAt"].includes(sortBy)) {
                throw new MissingRequiredDataException(
                    "Invalid sortBy value. Must be 'name', 'createdAt', or 'updatedAt'."
                );
            }

            const sortOrder = (req.query.sortOrder as string) || "asc";

            if (!["asc", "desc"].includes(sortOrder)) {
                throw new MissingRequiredDataException(
                    "Invalid sortOrder value. Must be 'asc' or 'desc'."
                );
            }

            const { projects, total } =
                await ProjectService.getProjectsByUserId(
                    userId,
                    page,
                    limit,
                    sortBy,
                    sortOrder
                );

            res.status(200).json({
                projects,
                total,
                page,
                limit,
            });
        } catch (error) {
            next(error);
        }
    }
}