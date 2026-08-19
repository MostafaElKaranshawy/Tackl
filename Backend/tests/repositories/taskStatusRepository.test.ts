import { afterEach, describe, expect, it, vi } from "vitest";
import TaskStatusRepository from "../../src/repositories/taskStatusRepository";
import TaskStatus from "../../src/models/taskStatus";
import AlreadyExistsException from "../../src/exceptions/alreadyExistsException";
import DBException from "../../src/exceptions/dbException";
import NotFoundException from "../../src/exceptions/notFoundException";

describe("TaskStatusRepository", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("create", () => {
        it("should create a task status without a transaction", async () => {
            const createdStatus = {
                projectId: "project-1",
                status: "review",
                order: 4,
            } as TaskStatus;

            vi.spyOn(TaskStatus, "findOne").mockResolvedValue(null);
            vi.spyOn(TaskStatus, "create").mockResolvedValue(createdStatus);

            const result = await TaskStatusRepository.create(
                "project-1",
                {
                    status: "Review",
                    order: 4,
                }
            );

            expect(result).toBe(createdStatus);

            expect(TaskStatus.findOne).toHaveBeenCalledWith({
                where: {
                    projectId: "project-1",
                    status: "review",
                },
            });

            expect(TaskStatus.create).toHaveBeenCalledWith({
                projectId: "project-1",
                status: "review",
                order: 4,
            });
        });

        it("should create a task status with a transaction", async () => {
            const createdStatus = {
                projectId: "project-1",
                status: "review",
                order: 4,
            } as TaskStatus;

            const transaction = {} as any;

            vi.spyOn(TaskStatus, "findOne").mockResolvedValue(null);
            vi.spyOn(TaskStatus, "create").mockResolvedValue(createdStatus);

            const result = await TaskStatusRepository.create(
                "project-1",
                {
                    status: "Review",
                    order: 4,
                },
                transaction
            );

            expect(result).toBe(createdStatus);

            expect(TaskStatus.create).toHaveBeenCalledWith(
                {
                    projectId: "project-1",
                    status: "review",
                    order: 4,
                },
                {
                    transaction,
                }
            );
        });

        it("should use 'to do' when status is not provided", async () => {
            const createdStatus = {
                projectId: "project-1",
                status: "to do",
                order: 0,
            } as TaskStatus;

            vi.spyOn(TaskStatus, "findOne").mockResolvedValue(null);
            vi.spyOn(TaskStatus, "create").mockResolvedValue(createdStatus);

            const result = await TaskStatusRepository.create(
                "project-1",
                {}
            );

            expect(result).toBe(createdStatus);

            expect(TaskStatus.findOne).toHaveBeenCalledWith({
                where: {
                    projectId: "project-1",
                    status: "to do",
                },
            });

            expect(TaskStatus.create).toHaveBeenCalledWith({
                projectId: "project-1",
                status: "to do",
                order: 0,
            });
        });

        it("should use order 0 when order is not provided", async () => {
            const createdStatus = {
                projectId: "project-1",
                status: "review",
                order: 0,
            } as TaskStatus;

            vi.spyOn(TaskStatus, "findOne").mockResolvedValue(null);
            vi.spyOn(TaskStatus, "create").mockResolvedValue(createdStatus);

            await TaskStatusRepository.create(
                "project-1",
                {
                    status: "Review",
                }
            );

            expect(TaskStatus.create).toHaveBeenCalledWith({
                projectId: "project-1",
                status: "review",
                order: 0,
            });
        });

        it("should throw AlreadyExistsException when the status already exists", async () => {
            const existingStatus = {
                projectId: "project-1",
                status: "review",
                order: 4,
            } as TaskStatus;

            vi.spyOn(TaskStatus, "findOne")
                .mockResolvedValue(existingStatus);

            const createSpy = vi.spyOn(TaskStatus, "create");

            await expect(
                TaskStatusRepository.create("project-1", {
                    status: "Review",
                    order: 4,
                })
            ).rejects.toBeInstanceOf(AlreadyExistsException);

            expect(createSpy).not.toHaveBeenCalled();
        });

        it("should wrap database errors in DBException", async () => {
            vi.spyOn(TaskStatus, "findOne")
                .mockRejectedValue(new Error("Database error"));

            await expect(
                TaskStatusRepository.create("project-1", {
                    status: "review",
                    order: 4,
                })
            ).rejects.toEqual(
                expect.objectContaining({
                    message: "Error creating task status: Database error",
                })
            );

            await expect(
                TaskStatusRepository.create("project-1", {
                    status: "review",
                    order: 4,
                })
            ).rejects.toBeInstanceOf(DBException);
        });
    });

    describe("findByPK", () => {
        it("should return the task status", async () => {
            const taskStatus = {
                projectId: "project-1",
                status: "review",
                order: 4,
            } as TaskStatus;

            vi.spyOn(TaskStatus, "findOne")
                .mockResolvedValue(taskStatus);

            const result = await TaskStatusRepository.findByPK(
                "project-1",
                "Review"
            );

            expect(result).toBe(taskStatus);

            expect(TaskStatus.findOne).toHaveBeenCalledWith({
                where: {
                    projectId: "project-1",
                    status: "review",
                },
            });
        });

        it("should throw NotFoundException when the task status does not exist", async () => {
            vi.spyOn(TaskStatus, "findOne")
                .mockResolvedValue(null);

            await expect(
                TaskStatusRepository.findByPK(
                    "project-1",
                    "review"
                )
            ).rejects.toBeInstanceOf(NotFoundException);
        });

        it("should wrap database errors in DBException", async () => {
            vi.spyOn(TaskStatus, "findOne")
                .mockRejectedValue(new Error("Database error"));

            await expect(
                TaskStatusRepository.findByPK(
                    "project-1",
                    "review"
                )
            ).rejects.toBeInstanceOf(DBException);
        });
    });

    describe("findByProjectId", () => {
        it("should return all task statuses for the project", async () => {
            const taskStatuses = [
                {
                    projectId: "project-1",
                    status: "to do",
                    order: 1,
                },
                {
                    projectId: "project-1",
                    status: "in progress",
                    order: 2,
                },
                {
                    projectId: "project-1",
                    status: "done",
                    order: 3,
                },
            ] as TaskStatus[];

            vi.spyOn(TaskStatus, "findAll")
                .mockResolvedValue(taskStatuses);

            const result =
                await TaskStatusRepository.findByProjectId(
                    "project-1"
                );

            expect(result).toBe(taskStatuses);

            expect(TaskStatus.findAll).toHaveBeenCalledWith({
                where: {
                    projectId: "project-1",
                },
                order: [
                    ["order", "ASC"],
                    ["updatedAt", "DESC"],
                ],
            });
        });

        it("should throw NotFoundException when no task statuses exist", async () => {
            vi.spyOn(TaskStatus, "findAll")
                .mockResolvedValue([]);

            await expect(
                TaskStatusRepository.findByProjectId("project-1")
            ).rejects.toBeInstanceOf(NotFoundException);
        });

        it("should wrap database errors in DBException", async () => {
            vi.spyOn(TaskStatus, "findAll")
                .mockRejectedValue(new Error("Database error"));

            await expect(
                TaskStatusRepository.findByProjectId("project-1")
            ).rejects.toBeInstanceOf(DBException);
        });
    });

    describe("findByStatus", () => {
        it("should return the task status", async () => {
            const taskStatus = {
                projectId: "project-1",
                status: "review",
                order: 4,
            } as TaskStatus;

            vi.spyOn(TaskStatus, "findOne")
                .mockResolvedValue(taskStatus);

            const result = await TaskStatusRepository.findByStatus(
                "project-1",
                "Review"
            );

            expect(result).toBe(taskStatus);

            expect(TaskStatus.findOne).toHaveBeenCalledWith({
                where: {
                    projectId: "project-1",
                    status: "review",
                },
            });
        });

        it("should throw NotFoundException when the task status does not exist", async () => {
            vi.spyOn(TaskStatus, "findOne")
                .mockResolvedValue(null);

            await expect(
                TaskStatusRepository.findByStatus(
                    "project-1",
                    "review"
                )
            ).rejects.toBeInstanceOf(NotFoundException);
        });

        it("should wrap database errors in DBException", async () => {
            vi.spyOn(TaskStatus, "findOne")
                .mockRejectedValue(new Error("Database error"));

            await expect(
                TaskStatusRepository.findByStatus(
                    "project-1",
                    "review"
                )
            ).rejects.toBeInstanceOf(DBException);
        });
    });

    describe("update", () => {
        it("should update the task status name and order", async () => {
            const taskStatus = {
                projectId: "project-1",
                status: "review",
                order: 4,
                update: vi.fn().mockResolvedValue(undefined),
            } as unknown as TaskStatus;

            vi.spyOn(TaskStatus, "findOne")
                .mockResolvedValueOnce(taskStatus)
                .mockResolvedValueOnce(null);

            const result = await TaskStatusRepository.update(
                "project-1",
                "review",
                {
                    status: "Testing",
                    order: 5,
                }
            );

            expect(taskStatus.update).toHaveBeenCalledWith({
                status: "testing",
                order: 5,
            });

            expect(result).toBe(taskStatus);
        });

        it("should update only the order when status is not provided", async () => {
            const taskStatus = {
                id: "status-1",
                projectId: "project-1",
                status: "review",
                order: 4,
                update: vi.fn().mockResolvedValue(undefined),
            } as unknown as TaskStatus;

            vi.spyOn(TaskStatus, "findOne")
                .mockResolvedValue(taskStatus);

            await TaskStatusRepository.update(
                "project-1",
                "review",
                {
                    order: 7,
                }
            );

            expect(taskStatus.update).toHaveBeenCalledWith({
                status: "review",
                order: 7,
            });
        });

        it("should preserve the existing order when order is not provided", async () => {
            const taskStatus = {
                id: "status-1",
                projectId: "project-1",
                status: "review",
                order: 4,
                update: vi.fn().mockResolvedValue(undefined),
            } as unknown as TaskStatus;

            vi.spyOn(TaskStatus, "findOne")
                .mockResolvedValueOnce(taskStatus)
                .mockResolvedValueOnce(null);

            await TaskStatusRepository.update(
                "project-1",
                "review",
                {
                    status: "testing",
                }
            );

            expect(taskStatus.update).toHaveBeenCalledWith({
                status: "testing",
                order: 4,
            });
        });

        it("should throw NotFoundException when the task status does not exist", async () => {
            vi.spyOn(TaskStatus, "findOne")
                .mockResolvedValue(null);

            await expect(
                TaskStatusRepository.update(
                    "project-1",
                    "review",
                    {
                        status: "testing",
                    }
                )
            ).rejects.toBeInstanceOf(NotFoundException);
        });

        it("should throw AlreadyExistsException when the new status already exists", async () => {
            const update = vi.fn();

            const taskStatus = {
                projectId: "project-1",
                status: "review",
                order: 4,
                update,
            } as unknown as TaskStatus;

            const existingStatus = {
                projectId: "project-1",
                status: "testing",
                order: 5,
                update,
            } as unknown as TaskStatus;

            vi.spyOn(TaskStatus, "findOne")
                .mockResolvedValueOnce(taskStatus)
                .mockResolvedValueOnce(existingStatus);

            const updateSpy = vi.spyOn(taskStatus, "update");

            await expect(
                TaskStatusRepository.update(
                    "project-1",
                    "review",
                    {
                        status: "Testing",
                    }
                )
            ).rejects.toBeInstanceOf(AlreadyExistsException);

            expect(updateSpy).not.toHaveBeenCalled();
        });

        it("should allow keeping the same status name", async () => {
            const taskStatus = {
                id: "status-1",
                projectId: "project-1",
                status: "review",
                order: 4,
                update: vi.fn().mockResolvedValue(undefined),
            } as unknown as TaskStatus;

            vi.spyOn(TaskStatus, "findOne")
                .mockResolvedValue(taskStatus);

            await TaskStatusRepository.update(
                "project-1",
                "review",
                {
                    status: "Review",
                }
            );

            expect(TaskStatus.findOne).toHaveBeenCalledTimes(1);

            expect(taskStatus.update).toHaveBeenCalledWith({
                status: "review",
                order: 4,
            });
        });

        it("should wrap database errors in DBException", async () => {
            vi.spyOn(TaskStatus, "findOne")
                .mockRejectedValue(new Error("Database error"));

            await expect(
                TaskStatusRepository.update(
                    "project-1",
                    "review",
                    {
                        status: "testing",
                    }
                )
            ).rejects.toBeInstanceOf(DBException);
        });

        it("should wrap errors from taskStatus.update in DBException", async () => {
            const taskStatus = {
                id: "status-1",
                projectId: "project-1",
                status: "review",
                order: 4,
                update: vi.fn().mockRejectedValue(
                    new Error("Update failed")
                ),
            } as unknown as TaskStatus;

            vi.spyOn(TaskStatus, "findOne")
                .mockResolvedValue(taskStatus);

            await expect(
                TaskStatusRepository.update(
                    "project-1",
                    "review",
                    {
                        order: 5,
                    }
                )
            ).rejects.toBeInstanceOf(DBException);
        });
    });

    describe("delete", () => {
        it("should delete the task status without a transaction", async () => {
            const taskStatus = {
                projectId: "project-1",
                status: "review",
                order: 4,
            } as TaskStatus;

            vi.spyOn(TaskStatus, "findOne")
                .mockResolvedValue(taskStatus);

            vi.spyOn(TaskStatus, "destroy")
                .mockResolvedValue(1);

            const result = await TaskStatusRepository.delete(
                "project-1",
                "Review"
            );

            expect(result).toBe(1);

            expect(TaskStatus.findOne).toHaveBeenCalledWith({
                where: {
                    projectId: "project-1",
                    status: "review",
                },
            });

            expect(TaskStatus.destroy).toHaveBeenCalledWith({
                where: {
                    projectId: "project-1",
                    status: "review",
                },
            });
        });

        it("should delete the task status with a transaction", async () => {
            const taskStatus = {
                projectId: "project-1",
                status: "review",
                order: 4,
            } as TaskStatus;

            const transaction = {} as any;

            vi.spyOn(TaskStatus, "findOne")
                .mockResolvedValue(taskStatus);

            vi.spyOn(TaskStatus, "destroy")
                .mockResolvedValue(1);

            const result = await TaskStatusRepository.delete(
                "project-1",
                "review",
                transaction
            );

            expect(result).toBe(1);

            expect(TaskStatus.destroy).toHaveBeenCalledWith({
                where: {
                    projectId: "project-1",
                    status: "review",
                },
                transaction,
            });
        });

        it("should throw NotFoundException when the task status does not exist", async () => {
            vi.spyOn(TaskStatus, "findOne")
                .mockResolvedValue(null);

            const destroySpy = vi.spyOn(TaskStatus, "destroy");

            await expect(
                TaskStatusRepository.delete(
                    "project-1",
                    "review"
                )
            ).rejects.toBeInstanceOf(NotFoundException);

            expect(destroySpy).not.toHaveBeenCalled();
        });

        it("should wrap database errors from findOne in DBException", async () => {
            vi.spyOn(TaskStatus, "findOne")
                .mockRejectedValue(new Error("Database error"));

            await expect(
                TaskStatusRepository.delete(
                    "project-1",
                    "review"
                )
            ).rejects.toBeInstanceOf(DBException);
        });

        it("should wrap database errors from destroy in DBException", async () => {
            const taskStatus = {
                projectId: "project-1",
                status: "review",
                order: 4,
            } as TaskStatus;

            vi.spyOn(TaskStatus, "findOne")
                .mockResolvedValue(taskStatus);

            vi.spyOn(TaskStatus, "destroy")
                .mockRejectedValue(new Error("Delete failed"));

            await expect(
                TaskStatusRepository.delete(
                    "project-1",
                    "review"
                )
            ).rejects.toBeInstanceOf(DBException);
        });
    });
});