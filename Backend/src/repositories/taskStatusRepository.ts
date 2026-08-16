import AlreadyExistsException from "../exceptions/alreadyExistsException";
import DBException from "../exceptions/dbException";
import NotFoundException from "../exceptions/notFoundException";
import TaskStatus from "../models/taskStatus";
import { Transaction } from "sequelize";
export default class TaskStatusRepository {
    static async create(
        projectId: string,
        taskStatusData: Partial<TaskStatus>,
        transaction?: Transaction
    ): Promise<TaskStatus> {
        try {
            const status = taskStatusData.status?.toLowerCase() || "to do";

            const existingStatus = await TaskStatus.findOne({
                where: {
                    projectId,
                    status: status.toLowerCase(),
                },
            });

            if (existingStatus) {
                throw new AlreadyExistsException(
                    "A status with the same name already exists in this project."
                );
            }
            if (transaction) {
                const taskStatus = await TaskStatus.create({
                    projectId,
                    status: status.toLowerCase(),
                    order: taskStatusData.order || 0,
                }, { transaction });
                return taskStatus;
            } else {
                const taskStatus = await TaskStatus.create({
                    projectId,
                    status: status.toLowerCase(),
                    order: taskStatusData.order || 0,
                });
                return taskStatus;
            }

        } catch (error) {
            if (error instanceof AlreadyExistsException) {
                throw error;
            }

            throw new DBException(
                "Error creating task status: " + (error as Error).message
            );
        }
    }

    static async findByPK(
        projectId: string,
        status: string
    ): Promise<TaskStatus> {
        try {
            const taskStatus = await TaskStatus.findOne({
                where: {
                    projectId,
                    status: status.toLowerCase(),
                },
            });

            if (!taskStatus) {
                throw new NotFoundException("Task status not found.");
            }

            return taskStatus;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new DBException(
                "Error finding task status: " + (error as Error).message
            );
        }
    }

    static async findByProjectId(
        projectId: string
    ): Promise<TaskStatus[]> {
        try {
            const taskStatuses = await TaskStatus.findAll({
                where: {
                    projectId,
                },
                order: [["order", "ASC"], ["updatedAt", "DESC"]],
            });

            if (taskStatuses.length === 0) {
                throw new NotFoundException(
                    "No task statuses found for the given project."
                );
            }

            return taskStatuses;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new DBException(
                "Error finding task statuses by project ID: " +
                (error as Error).message
            );
        }
    }

    static async findByStatus(
        projectId: string,
        status: string
    ): Promise<TaskStatus> {
        try {
            const taskStatus = await TaskStatus.findOne({
                where: {
                    projectId,
                    status: status.toLowerCase(),
                },
            });

            if (!taskStatus) {
                throw new NotFoundException("Task status not found.");
            }

            return taskStatus;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new DBException(
                "Error finding task status by status: " +
                (error as Error).message
            );
        }
    }

    static async update(
        projectId: string,
        status: string,
        taskStatusData: Partial<TaskStatus>
    ): Promise<TaskStatus> {
        try {
            const taskStatus = await TaskStatus.findOne({
                where: {
                    projectId,
                    status: status.toLowerCase(),
                },
            });

            if (!taskStatus) {
                throw new NotFoundException("Task status not found.");
            }

            const newStatus =
                taskStatusData.status?.toLowerCase();

            if (newStatus && newStatus !== taskStatus.status) {
                const existingStatus = await TaskStatus.findOne({
                    where: {
                        projectId,
                        status: newStatus.toLowerCase(),
                    },
                });

                if (existingStatus) {
                    throw new AlreadyExistsException(
                        "A task status with the same name already exists in this project."
                    );
                }
            }

            await taskStatus.update({
                status: newStatus?.toLowerCase() || taskStatus.status.toLocaleLowerCase(),
                order:
                    taskStatusData.order !== undefined
                        ? taskStatusData.order
                        : taskStatus.order,
            });

            return taskStatus;
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof AlreadyExistsException
            ) {
                throw error;
            }

            throw new DBException(
                "Error updating task status: " +
                (error as Error).message
            );
        }
    }

    static async delete(projectId: string, status: string, transaction?: Transaction): Promise<number> {
        try {
            const taskStatus = await TaskStatus.findOne({
                where: {
                    projectId,
                    status: status.toLowerCase(),
                },
            });

            if (!taskStatus) {
                throw new NotFoundException("Task status not found.");
            }

            if (transaction) {
                const deletedCount = await TaskStatus.destroy({
                    where: {
                        projectId,
                        status: status.toLowerCase(),
                    },
                    transaction,
                });

                return deletedCount;
            }
            
            const deletedCount = await TaskStatus.destroy({
                where: {
                    projectId,
                    status: status.toLowerCase(),
                },
            });

            return deletedCount;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new DBException(
                "Error deleting task status: " +
                (error as Error).message
            );
        }
    }
}