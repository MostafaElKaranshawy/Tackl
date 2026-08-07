import ForbiddenException from "../exceptions/forbiddenException";
import MissingRequiredDataException from "../exceptions/missingRequiredDataException";
import NotFoundException from "../exceptions/notFoundException";
import ProjectService from "../services/projectService";
import ErrorHandler from "../exceptions/errorHandler";
export default class ProjectController {
    static async createProject(req: any, res: any) {
        try {

            const userId = req.userId;
            const projectData = req.body;

            if (!projectData.name) {
                throw new MissingRequiredDataException("Missing required project data.");
            }

            const project = await ProjectService.createProject({ name: projectData.name, description: projectData.description || null }, userId);

            res.status(201).json(project);
        } catch (error) {
            if (error instanceof MissingRequiredDataException) {
                res.status(400).json({ message: error.message });
            } else {
                ErrorHandler(error, req, res);
            }
        }
    }

    static async getProjectById(req: any, res: any) {
        try {

            const userId = req.userId;
            const projectId = req.params.id;

            if (!projectId) {
                throw new MissingRequiredDataException("Project ID is required.");
            }

            const project = await ProjectService.getProjectById(projectId, userId);

            res.status(200).json(project);

        } catch (error) {
            ErrorHandler(error, req, res);
        }
    }

    static async updateProject(req: any, res: any) {
        try {
            const userId = req.userId;
            const projectId = req.params.id;
            const updatedData = req.body;

            if (!projectId) {
                throw new MissingRequiredDataException("Project ID is required.");
            }

            if (!updatedData.name && !updatedData.description) {
                throw new MissingRequiredDataException("At least one field (name or description) must be provided for update.");
            }

            const project = await ProjectService.updateProject(projectId, { name: updatedData.name, description: updatedData.description }, userId);
            res.status(200).json(project);
        } catch (error) {
            ErrorHandler(error, req, res);
        }
    }

    static async deleteProject(req: any, res: any) {
        try {
            const userId = req.userId;
            const projectId = req.params.id;
            if (!projectId) {
                throw new MissingRequiredDataException("Project ID is required.");
            }
            await ProjectService.deleteProject(projectId, userId);

            res.status(204).send();

        } catch (error) {
            ErrorHandler(error, req, res);
        }
    }

    static async getUserProjects(req: any, res: any) {
        try {
            const userId = req.userId;
            const page = parseInt(req.query.page) || 1;
            if (page < 1) {
                throw new MissingRequiredDataException("Page number must be greater than 0.");
            }
            const limit = parseInt(req.query.limit) || 10;
            if (limit < 1) {
                throw new MissingRequiredDataException("Limit must be greater than 0.");
            }
            const sortBy = req.query.sortBy || 'createdAt';

            if (!['name', 'createdAt', 'updatedAt'].includes(sortBy)) {
                throw new MissingRequiredDataException("Invalid sortBy value. Must be 'name' or 'createdAt'.");
            }

            const sortOrder = req.query.sortOrder || 'asc';

            if (!['asc', 'desc'].includes(sortOrder)) {
                throw new MissingRequiredDataException("Invalid sortOrder value. Must be 'asc' or 'desc'.");
            }

            const { projects, total } = await ProjectService.getProjectsByUserId(userId, page, limit, sortBy, sortOrder);

            res.status(200).json({ projects, total, page, limit });

        } catch (error) {
            ErrorHandler(error, req, res);
        }
    }
}