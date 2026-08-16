import { NextFunction, Request, Response } from "express";
import ForbiddenException from "../exceptions/forbiddenException";
import MissingRequiredDataException from "../exceptions/missingRequiredDataException";
import BoardColumnService from "../services/boardColumnService";
import { TaskStatus } from "../enums/taskStatus";

export default class BoardColumnController {
    static async createBoardColumn(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;
            const { projectId } = req.params;
            const boardColumnData = req.body;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            if (!projectId || typeof projectId !== "string") {
                throw new MissingRequiredDataException(
                    "Project ID is required."
                );
            }

            if (!boardColumnData || typeof boardColumnData !== "object") {
                throw new MissingRequiredDataException(
                    "Board column data is required."
                );
            }

            if (!boardColumnData.name) {
                throw new MissingRequiredDataException(
                    "Board column name is required."
                );
            }

            if (boardColumnData.order === undefined) {
                throw new MissingRequiredDataException(
                    "Board column order is required."
                );
            }

            if (!boardColumnData.status || !Object.values(TaskStatus).includes(boardColumnData.status)) {
                throw new MissingRequiredDataException(
                    "Board column status is required."
                );
            }

            const boardColumn =
                await BoardColumnService.createBoardColumn(
                    userId,
                    projectId,
                    {
                        name: boardColumnData.name,
                        status: boardColumnData.status,
                        order: boardColumnData.order,
                    }
                );

            res.status(201).json(boardColumn);
        } catch (error) {
            next(error);
        }
    }

    static async getBoardColumnById(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;
            const { projectId, boardId } = req.params;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            if (!projectId || typeof projectId !== "string") {
                throw new MissingRequiredDataException(
                    "Project ID is required."
                );
            }

            if (!boardId || typeof boardId !== "string") {
                throw new MissingRequiredDataException(
                    "Board column ID is required."
                );
            }

            const boardColumn =
                await BoardColumnService.getBoardColumnById(
                    userId,
                    projectId,
                    boardId
                );

            res.status(200).json(boardColumn);
        } catch (error) {
            next(error);
        }
    }

    static async getBoardColumnsByProjectId(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;
            const { projectId } = req.params;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            if (!projectId || typeof projectId !== "string") {
                throw new MissingRequiredDataException(
                    "Project ID is required."
                );
            }

            const boardColumns =
                await BoardColumnService.getBoardColumnsByProjectId(
                    userId,
                    projectId
                );

            res.status(200).json(boardColumns);
        } catch (error) {
            next(error);
        }
    }

    static async updateBoardColumn(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;
            const { projectId, boardColumnId } = req.params;
            const updatedData = req.body;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            if (!projectId || typeof projectId !== "string") {
                throw new MissingRequiredDataException(
                    "Project ID is required."
                );
            }

            if (!boardColumnId || typeof boardColumnId !== "string") {
                throw new MissingRequiredDataException(
                    "Board column ID is required."
                );
            }

            if (
                updatedData?.name === undefined &&
                updatedData?.status === undefined &&
                updatedData?.order === undefined
            ) {
                throw new MissingRequiredDataException(
                    "At least one field (name, status, or order) must be provided for update."
                );
            }

            const boardColumn =
                await BoardColumnService.updateBoardColumn(
                    userId,
                    projectId,
                    boardColumnId,
                    {
                        name: updatedData.name,
                        status: updatedData.status,
                        order: updatedData.order,
                    }
                );

            res.status(200).json(boardColumn);
        } catch (error) {
            next(error);
        }
    }

    static async deleteBoardColumn(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;
            const { projectId, boardColumnId } = req.params;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            if (!projectId || typeof projectId !== "string") {
                throw new MissingRequiredDataException(
                    "Project ID is required."
                );
            }

            if (!boardColumnId || typeof boardColumnId !== "string") {
                throw new MissingRequiredDataException(
                    "Board column ID is required."
                );
            }

            await BoardColumnService.deleteBoardColumn(
                userId,
                projectId,
                boardColumnId
            );

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}