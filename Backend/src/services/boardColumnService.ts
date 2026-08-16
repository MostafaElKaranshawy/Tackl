import ForbiddenException from "../exceptions/forbiddenException";
import NotFoundException from "../exceptions/notFoundException";
import BoardColumn from "../models/boardColumn";
import BoardColumnRepository from "../repositories/boardColumnRepository";
import ProjectRepository from "../repositories/projectRepository";
import TaskService from "./taskService";

export default class BoardColumnService {
    static async createBoardColumn(userId: string, projectId: string, boardColumnData: Partial<BoardColumn>): Promise<BoardColumn> {
        await this.checkProjectOwnership(userId, projectId);

        return await BoardColumnRepository.create(projectId, boardColumnData);
    }

    static async getBoardColumnById(userId: string, projectId: string, id: string): Promise<BoardColumn> {
        await this.checkProjectOwnership(userId, projectId);

        const boardColumn = await BoardColumnRepository.findById(id);
        if (!boardColumn) {
            throw new NotFoundException("Board column not found.");
        }

        if (boardColumn.projectId !== projectId) {
            throw new ForbiddenException("Board column does not belong to the specified project.");
        }
        return boardColumn;
    }

    static async getBoardColumnsByProjectId(userId: string, projectId: string): Promise<BoardColumn[]> {
        await this.checkProjectOwnership(userId, projectId);

        return await BoardColumnRepository.findByProjectId(projectId);
    }

    static async updateBoardColumn(userId: string, projectId: string, id: string, boardColumnData: Partial<BoardColumn>): Promise<BoardColumn> {
        await this.checkProjectOwnership(userId, projectId);

        const boardColumn = await BoardColumnRepository.findById(id);

        if (boardColumn.projectId !== projectId) {
            throw new ForbiddenException("Board column does not belong to the specified project.");
        }

        const updatedBoardColumn = await BoardColumnRepository.update(id, boardColumnData);
        if (updatedBoardColumn.status != boardColumnData.status) {
            const tasks = await TaskService.getTaskByColumnId(projectId, id, userId);
            for (const task of tasks) {
                await TaskService.updateTask(projectId, task.id, { status: updatedBoardColumn.status, columnId: updatedBoardColumn.id }, userId);
            }
        }
        return updatedBoardColumn;
    }

    static async deleteBoardColumn(userId: string, projectId: string, id: string): Promise<number> {
        await this.checkProjectOwnership(userId, projectId);

        const boardColumn = await BoardColumnRepository.findById(id);

        if (boardColumn.projectId !== projectId) {
            throw new ForbiddenException("Board column does not belong to the specified project.");
        }

        return await BoardColumnRepository.delete(id);
    }

    private static async checkProjectOwnership(userId: string, projectId: string): Promise<void> {
        const project = await ProjectRepository.getProjectById(projectId);
        if (!project) {
            throw new NotFoundException("Project not found.");
        }
        if (project.userId !== userId) {
            throw new ForbiddenException("User is not the owner of the project.");
        }

    }

}
