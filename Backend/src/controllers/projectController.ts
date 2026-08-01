import ForbiddenException from "../exceptions/forbiddenException";
import NotFoundException from "../exceptions/notFoundException";
import ProjectService from "../services/projectService";

export default class ProjectController {
    static async createProject(req: any, res: any) {
        try {

            const userId = req.userId;
            const projectData = req.body;
            const project = await ProjectService.createProject(projectData, userId);

            res.status(201).json(project);
        } catch (error) {
            if (error instanceof ForbiddenException) {
                res.status(403).json({ message: error.message });
            } else {
                res.status(500).json({ message: (error as Error).message });
            }
        }
    }

    static async getProjectById(req: any, res: any) {
        try {

            const userId = req.userId;
            const projectId = req.params.id;
            const project = await ProjectService.getProjectById(projectId, userId);

            res.status(200).json(project);

        } catch (error) {
            if (error instanceof NotFoundException) {
                res.status(404).json({ message: error.message });
            } else if (error instanceof ForbiddenException) {
                res.status(403).json({ message: error.message });
            } else {
                res.status(500).json({ message: (error as Error).message });
            }
        }
    }

    static async updateProject(req: any, res: any) {
        try {
            const userId = req.userId;
            const projectId = req.params.id;
            const updatedData = req.body;
            const project = await ProjectService.updateProject(projectId, updatedData, userId);
            res.status(200).json(project);
        } catch (error) {
            if (error instanceof NotFoundException) {
                res.status(404).json({ message: error.message });
            } else if (error instanceof ForbiddenException) {
                res.status(403).json({ message: error.message });
            } else {
                res.status(500).json({ message: (error as Error).message });
            }
        }
    }

    static async deleteProject(req: any, res: any) {
        try {
            const userId = req.userId;
            const projectId = req.params.id;
            await ProjectService.deleteProject(projectId, userId);
            res.status(204).send();
        } catch (error) {
            if (error instanceof NotFoundException) {
                res.status(404).json({ message: error.message });
            } else if (error instanceof ForbiddenException) {
                res.status(403).json({ message: error.message });
            } else {
                res.status(500).json({ message: (error as Error).message });
            }
        }
    }

    static async getUserProjects(req: any, res: any) {
        try {
            const userId = req.userId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sortBy = req.query.sortBy || 'createdAt';
            const sortOrder = req.query.sortOrder || 'asc';
            const { projects, total } = await ProjectService.getProjectsByUserId(userId, page, limit, sortBy, sortOrder);
            res.status(200).json({ projects, total, page, limit });
        } catch (error) {
            if (error instanceof NotFoundException) {
                res.status(404).json({ message: error.message });
            } else if (error instanceof ForbiddenException) {
                res.status(403).json({ message: error.message });
            } else {
                res.status(500).json({ message: (error as Error).message });
            }
        }
    }
}