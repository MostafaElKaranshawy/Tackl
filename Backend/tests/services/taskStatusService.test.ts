import { afterEach, describe, expect, it, vi } from "vitest";
import TaskStatusService from "../../src/services/taskStatusService";
import TaskStatusRepository from "../../src/repositories/taskStatusRepository";
import ProjectRepository from "../../src/repositories/projectRepository";
import TaskService from "../../src/services/taskService";
import { sequelize } from "../../src/config/database";
import ForbiddenException from "../../src/exceptions/forbiddenException";
import NotFoundException from "../../src/exceptions/notFoundException";
import TaskStatus from "../../src/models/taskStatus";

describe("TaskStatusService", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("createTaskStatus", () => {
        it("should create a task status for a project owned by the user", async () => {
            const taskStatusData = {
                status: "review",
                order: 4,
            };

            const createdTaskStatus = {
                projectId: "project-1",
                status: "review",
                order: 4,
            } as TaskStatus;

            vi.spyOn(ProjectRepository, "getProjectById").mockResolvedValue({
                id: "project-1",
                userId: "user-1",
            } as any);

            vi.spyOn(TaskStatusRepository, "create")
                .mockResolvedValue(createdTaskStatus);

            const result = await TaskStatusService.createTaskStatus(
                "user-1",
                "project-1",
                taskStatusData
            );

            expect(result).toEqual(createdTaskStatus);

            expect(ProjectRepository.getProjectById).toHaveBeenCalledWith(
                "project-1"
            );

            expect(TaskStatusRepository.create).toHaveBeenCalledWith(
                "project-1",
                taskStatusData
            );
        });

        it("should throw NotFoundException when the project does not exist", async () => {
            vi.spyOn(ProjectRepository, "getProjectById")
                .mockResolvedValue(null);

            const createSpy = vi.spyOn(TaskStatusRepository, "create");

            await expect(
                TaskStatusService.createTaskStatus(
                    "user-1",
                    "project-1",
                    {
                        status: "review",
                        order: 4,
                    }
                )
            ).rejects.toBeInstanceOf(NotFoundException);

            expect(createSpy).not.toHaveBeenCalled();
        });

        it("should throw ForbiddenException when the user does not own the project", async () => {
            vi.spyOn(ProjectRepository, "getProjectById").mockResolvedValue({
                id: "project-1",
                userId: "user-2",
            } as any);

            const createSpy = vi.spyOn(TaskStatusRepository, "create");

            await expect(
                TaskStatusService.createTaskStatus(
                    "user-1",
                    "project-1",
                    {
                        status: "review",
                        order: 4,
                    }
                )
            ).rejects.toBeInstanceOf(ForbiddenException);

            expect(createSpy).not.toHaveBeenCalled();
        });
    });

    describe("getTaskStatusByPK", () => {
        it("should return the requested task status", async () => {
            const taskStatus = {
                projectId: "project-1",
                status: "in progress",
                order: 2,
            } as TaskStatus;

            vi.spyOn(ProjectRepository, "getProjectById").mockResolvedValue({
                id: "project-1",
                userId: "user-1",
            } as any);

            vi.spyOn(TaskStatusRepository, "findByPK")
                .mockResolvedValue(taskStatus);

            const result = await TaskStatusService.getTaskStatusByPK(
                "user-1",
                "project-1",
                "in progress"
            );

            expect(result).toEqual(taskStatus);

            expect(TaskStatusRepository.findByPK).toHaveBeenCalledWith(
                "project-1",
                "in progress"
            );
        });

        it("should throw NotFoundException when the project does not exist", async () => {
            vi.spyOn(ProjectRepository, "getProjectById")
                .mockResolvedValue(null);

            const findSpy = vi.spyOn(TaskStatusRepository, "findByPK");

            await expect(
                TaskStatusService.getTaskStatusByPK(
                    "user-1",
                    "project-1",
                    "done"
                )
            ).rejects.toBeInstanceOf(NotFoundException);

            expect(findSpy).not.toHaveBeenCalled();
        });

        it("should throw ForbiddenException when the user does not own the project", async () => {
            vi.spyOn(ProjectRepository, "getProjectById").mockResolvedValue({
                id: "project-1",
                userId: "user-2",
            } as any);

            const findSpy = vi.spyOn(TaskStatusRepository, "findByPK");

            await expect(
                TaskStatusService.getTaskStatusByPK(
                    "user-1",
                    "project-1",
                    "done"
                )
            ).rejects.toBeInstanceOf(ForbiddenException);

            expect(findSpy).not.toHaveBeenCalled();
        });
    });

    describe("getTaskStatusesByProjectId", () => {
        it("should return all task statuses for a project", async () => {
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

            vi.spyOn(ProjectRepository, "getProjectById").mockResolvedValue({
                id: "project-1",
                userId: "user-1",
            } as any);

            vi.spyOn(TaskStatusRepository, "findByProjectId")
                .mockResolvedValue(taskStatuses);

            const result =
                await TaskStatusService.getTaskStatusesByProjectId(
                    "user-1",
                    "project-1"
                );

            expect(result).toEqual(taskStatuses);

            expect(
                TaskStatusRepository.findByProjectId
            ).toHaveBeenCalledWith("project-1");
        });

        it("should throw NotFoundException when the project does not exist", async () => {
            vi.spyOn(ProjectRepository, "getProjectById")
                .mockResolvedValue(null);

            const findSpy = vi.spyOn(
                TaskStatusRepository,
                "findByProjectId"
            );

            await expect(
                TaskStatusService.getTaskStatusesByProjectId(
                    "user-1",
                    "project-1"
                )
            ).rejects.toBeInstanceOf(NotFoundException);

            expect(findSpy).not.toHaveBeenCalled();
        });

        it("should throw ForbiddenException when the user does not own the project", async () => {
            vi.spyOn(ProjectRepository, "getProjectById").mockResolvedValue({
                id: "project-1",
                userId: "user-2",
            } as any);

            const findSpy = vi.spyOn(
                TaskStatusRepository,
                "findByProjectId"
            );

            await expect(
                TaskStatusService.getTaskStatusesByProjectId(
                    "user-1",
                    "project-1"
                )
            ).rejects.toBeInstanceOf(ForbiddenException);

            expect(findSpy).not.toHaveBeenCalled();
        });
    });

    describe("updateTaskStatus", () => {
        it("should update the task status without updating tasks when the status name does not change", async () => {
            const oldTaskStatus = {
                projectId: "project-1",
                status: "review",
                order: 4,
            } as TaskStatus;

            const updatedTaskStatus = {
                projectId: "project-1",
                status: "review",
                order: 5,
            } as TaskStatus;

            vi.spyOn(ProjectRepository, "getProjectById").mockResolvedValue({
                id: "project-1",
                userId: "user-1",
            } as any);

            vi.spyOn(TaskStatusRepository, "findByPK")
                .mockResolvedValue(oldTaskStatus);

            vi.spyOn(TaskStatusRepository, "update")
                .mockResolvedValue(updatedTaskStatus);

            const getTasksSpy = vi.spyOn(
                TaskService,
                "getTaskByTaskStatus"
            );

            const updateTaskSpy = vi.spyOn(
                TaskService,
                "updateTask"
            );

            const result = await TaskStatusService.updateTaskStatus(
                "user-1",
                "project-1",
                "review",
                {
                    order: 5,
                }
            );

            expect(result).toEqual(updatedTaskStatus);

            expect(TaskStatusRepository.findByPK).toHaveBeenCalledWith(
                "project-1",
                "review"
            );

            expect(TaskStatusRepository.update).toHaveBeenCalledWith(
                "project-1",
                "review",
                {
                    order: 5,
                }
            );

            expect(getTasksSpy).not.toHaveBeenCalled();
            expect(updateTaskSpy).not.toHaveBeenCalled();
        });

        it("should update all tasks when the status name changes", async () => {
            const oldTaskStatus = {
                projectId: "project-1",
                status: "review",
                order: 4,
            } as TaskStatus;

            const updatedTaskStatus = {
                projectId: "project-1",
                status: "testing",
                order: 4,
            } as TaskStatus;

            const tasks = [
                {
                    id: "task-1",
                },
                {
                    id: "task-2",
                },
            ];

            vi.spyOn(ProjectRepository, "getProjectById").mockResolvedValue({
                id: "project-1",
                userId: "user-1",
            } as any);

            vi.spyOn(TaskStatusRepository, "findByPK")
                .mockResolvedValue(oldTaskStatus);

            vi.spyOn(TaskStatusRepository, "update")
                .mockResolvedValue(updatedTaskStatus);

            vi.spyOn(TaskService, "getTaskByTaskStatus")
                .mockResolvedValue(tasks as any);

            vi.spyOn(TaskService, "updateTask")
                .mockResolvedValue({} as any);

            const result = await TaskStatusService.updateTaskStatus(
                "user-1",
                "project-1",
                "review",
                {
                    status: "Testing",
                }
            );

            expect(result).toEqual(updatedTaskStatus);

            expect(TaskStatusRepository.update).toHaveBeenCalledWith(
                "project-1",
                "review",
                {
                    status: "Testing",
                }
            );

            expect(TaskService.getTaskByTaskStatus).toHaveBeenCalledWith(
                "project-1",
                "review",
                "user-1"
            );

            expect(TaskService.updateTask).toHaveBeenCalledTimes(2);

            expect(TaskService.updateTask).toHaveBeenNthCalledWith(
                1,
                "project-1",
                "task-1",
                {
                    status: "testing",
                },
                "user-1"
            );

            expect(TaskService.updateTask).toHaveBeenNthCalledWith(
                2,
                "project-1",
                "task-2",
                {
                    status: "testing",
                },
                "user-1"
            );
        });

        it("should use the lowercase status when updating tasks", async () => {
            const oldTaskStatus = {
                projectId: "project-1",
                status: "review",
                order: 4,
            } as TaskStatus;

            vi.spyOn(ProjectRepository, "getProjectById").mockResolvedValue({
                id: "project-1",
                userId: "user-1",
            } as any);

            vi.spyOn(TaskStatusRepository, "findByPK")
                .mockResolvedValue(oldTaskStatus);

            vi.spyOn(TaskStatusRepository, "update")
                .mockResolvedValue({
                    ...oldTaskStatus,
                    status: "in testing",
                } as TaskStatus);

            vi.spyOn(TaskService, "getTaskByTaskStatus")
                .mockResolvedValue([
                    {
                        id: "task-1",
                    },
                ] as any);

            const updateTaskSpy = vi.spyOn(
                TaskService,
                "updateTask"
            ).mockResolvedValue({} as any);

            await TaskStatusService.updateTaskStatus(
                "user-1",
                "project-1",
                "review",
                {
                    status: "IN TESTING",
                }
            );

            expect(updateTaskSpy).toHaveBeenCalledWith(
                "project-1",
                "task-1",
                {
                    status: "in testing",
                },
                "user-1"
            );
        });

        it("should throw NotFoundException when the project does not exist", async () => {
            vi.spyOn(ProjectRepository, "getProjectById")
                .mockResolvedValue(null);

            const findSpy = vi.spyOn(TaskStatusRepository, "findByPK");

            await expect(
                TaskStatusService.updateTaskStatus(
                    "user-1",
                    "project-1",
                    "review",
                    {
                        status: "testing",
                    }
                )
            ).rejects.toBeInstanceOf(NotFoundException);

            expect(findSpy).not.toHaveBeenCalled();
        });

        it("should throw ForbiddenException when the user does not own the project", async () => {
            vi.spyOn(ProjectRepository, "getProjectById").mockResolvedValue({
                id: "project-1",
                userId: "user-2",
            } as any);

            const findSpy = vi.spyOn(TaskStatusRepository, "findByPK");

            await expect(
                TaskStatusService.updateTaskStatus(
                    "user-1",
                    "project-1",
                    "review",
                    {
                        status: "testing",
                    }
                )
            ).rejects.toBeInstanceOf(ForbiddenException);

            expect(findSpy).not.toHaveBeenCalled();
        });
    });

    describe("deleteTaskStatus", () => {
        it("should update tasks to 'to do' and delete the task status inside a transaction", async () => {
            const tasks = [
                {
                    id: "task-1",
                },
                {
                    id: "task-2",
                },
            ];

            vi.spyOn(ProjectRepository, "getProjectById").mockResolvedValue({
                id: "project-1",
                userId: "user-1",
            } as any);

            vi.spyOn(TaskService, "getTaskByTaskStatus")
                .mockResolvedValue(tasks as any);

            vi.spyOn(TaskService, "updateTask")
                .mockResolvedValue({} as any);

            vi.spyOn(TaskStatusRepository, "delete")
                .mockResolvedValue(2);

            vi.spyOn(sequelize, "transaction")
                .mockImplementation(async (callback: any) => {
                    return await callback("transaction");
                });

            const result = await TaskStatusService.deleteTaskStatus(
                "user-1",
                "project-1",
                "review"
            );

            expect(result).toBe(2);

            expect(TaskService.getTaskByTaskStatus).toHaveBeenCalledWith(
                "project-1",
                "review",
                "user-1"
            );

            expect(TaskService.updateTask).toHaveBeenCalledTimes(2);

            expect(TaskService.updateTask).toHaveBeenNthCalledWith(
                1,
                "project-1",
                "task-1",
                {
                    status: "to do",
                },
                "user-1",
                "transaction"
            );

            expect(TaskService.updateTask).toHaveBeenNthCalledWith(
                2,
                "project-1",
                "task-2",
                {
                    status: "to do",
                },
                "user-1",
                "transaction"
            );

            expect(TaskStatusRepository.delete).toHaveBeenCalledWith(
                "project-1",
                "review",
                "transaction"
            );
        });

        it("should delete the task status without updating tasks when there are no tasks", async () => {
            vi.spyOn(ProjectRepository, "getProjectById").mockResolvedValue({
                id: "project-1",
                userId: "user-1",
            } as any);

            vi.spyOn(TaskService, "getTaskByTaskStatus")
                .mockResolvedValue([]);

            vi.spyOn(TaskStatusRepository, "delete")
                .mockResolvedValue(1);

            vi.spyOn(sequelize, "transaction")
                .mockImplementation(async (callback: any) => {
                    return await callback("transaction");
                });

            const updateTaskSpy = vi.spyOn(
                TaskService,
                "updateTask"
            );

            const result = await TaskStatusService.deleteTaskStatus(
                "user-1",
                "project-1",
                "review"
            );

            expect(result).toBe(1);
            expect(updateTaskSpy).not.toHaveBeenCalled();

            expect(TaskStatusRepository.delete).toHaveBeenCalledWith(
                "project-1",
                "review",
                "transaction"
            );
        });

        it("should throw NotFoundException when the project does not exist", async () => {
            vi.spyOn(ProjectRepository, "getProjectById")
                .mockResolvedValue(null);

            const getTasksSpy = vi.spyOn(
                TaskService,
                "getTaskByTaskStatus"
            );

            const transactionSpy = vi.spyOn(
                sequelize,
                "transaction"
            );

            await expect(
                TaskStatusService.deleteTaskStatus(
                    "user-1",
                    "project-1",
                    "review"
                )
            ).rejects.toBeInstanceOf(NotFoundException);

            expect(getTasksSpy).not.toHaveBeenCalled();
            expect(transactionSpy).not.toHaveBeenCalled();
        });

        it("should throw ForbiddenException when the user does not own the project", async () => {
            vi.spyOn(ProjectRepository, "getProjectById").mockResolvedValue({
                id: "project-1",
                userId: "user-2",
            } as any);

            const getTasksSpy = vi.spyOn(
                TaskService,
                "getTaskByTaskStatus"
            );

            const transactionSpy = vi.spyOn(
                sequelize,
                "transaction"
            );

            await expect(
                TaskStatusService.deleteTaskStatus(
                    "user-1",
                    "project-1",
                    "review"
                )
            ).rejects.toBeInstanceOf(ForbiddenException);

            expect(getTasksSpy).not.toHaveBeenCalled();
            expect(transactionSpy).not.toHaveBeenCalled();
        });
    });
});