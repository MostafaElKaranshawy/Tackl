import AlreadyExistsException from "../exceptions/alreadyExistsException";
import DBException from "../exceptions/dbException";
import NotFoundException from "../exceptions/notFoundException";
import BoardColumn from "../models/boardColumn";

export default class BoardColumnRepository {
    static async create(projectId: string, boardColumnData: Partial<BoardColumn>): Promise<BoardColumn> {
        try {

            const existingColumn = await BoardColumn.findOne({
                where: {
                    projectId,
                    name: boardColumnData.name?.toLowerCase(),
                },
            });
    
            if (existingColumn) {
                throw new AlreadyExistsException("A columnT[]>; with the same name already exists in this project.");
            }
            const boardColumn = await BoardColumn.create(
                {
                    ...boardColumnData,
                    projectId,
                    name: boardColumnData.name?.toLowerCase(),
                }
            );
            return boardColumn;
        } catch (error) {
            if (error instanceof AlreadyExistsException) {
                throw error;
            }
            throw new Error("Error creating board column: " + (error as Error).message);
        }
    }

    static async findById(id: string): Promise<BoardColumn> {
        try {
            const boardColumn = await BoardColumn.findByPk(id);
            if (!boardColumn) {
                throw new NotFoundException("Board column not found.");
            }
            return boardColumn;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new DBException("Error finding board column by ID: " + (error as Error).message);
        }
    }
    static async findByProjectId(projectId: string): Promise<BoardColumn[]> {
        try {
            const boardColumns = await BoardColumn.findAll({ where: { projectId } });
            if (!boardColumns) {
                throw new NotFoundException("No board columns found for the given project.");
            }
            return boardColumns;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new DBException("Error finding board columns by project ID: " + (error as Error).message);
        }
    }
    static async findByName(projectId: string, name: string): Promise<BoardColumn> {
        try {
            const boardColumn = await BoardColumn.findOne({ where: { projectId, name: name.toLowerCase() } });
            if (!boardColumn) {
                throw new NotFoundException("Board column not found.");
            }
            return boardColumn;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new DBException("Error finding board column by name: " + (error as Error).message);
        }
    }

    static async update(id: string, boardColumnData: Partial<BoardColumn>): Promise<BoardColumn> {
        try {

            const newName = boardColumnData.name?.toLowerCase();
            const boardColumn = await BoardColumn.findByPk(id);
            if (!boardColumn) {
                throw new NotFoundException("Board column not found.");
            }
            if (newName && newName !== boardColumn.name) {
                const existingColumn = await BoardColumn.findOne({
                    where: {
                        projectId: boardColumn.projectId,
                        name: newName,
                    },
                });
                if (existingColumn) {
                    throw new AlreadyExistsException("A column with the same name already exists in this project.");
                }
            }
            await boardColumn.update({
                name: newName || boardColumn.name,
                order: boardColumnData.order !== undefined ? boardColumnData.order : boardColumn.order,
                status: boardColumnData.status !== undefined ? boardColumnData.status : boardColumn.status,
            });
            return boardColumn;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof AlreadyExistsException) {
                throw error;
            }
            throw new DBException("Error updating board column: " + (error as Error).message);
        }
    }

    static async delete(id: string): Promise<number> {
        try {
            const boardColumn = await BoardColumn.findByPk(id);
            if (!boardColumn) {
                throw new NotFoundException("Board column not found.");
            }
            const deletedCount = await BoardColumn.destroy({ where: { id } });
            return deletedCount;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new DBException("Error deleting board column: " + (error as Error).message);
        }
    }
}