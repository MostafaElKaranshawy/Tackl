import { afterEach, describe, expect, it, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import TaskStatusController from "../../src/controllers/taskStatusController";
import TaskStatusService from "../../src/services/taskStatusService";
import ForbiddenException from "../../src/exceptions/forbiddenException";
import MissingRequiredDataException from "../../src/exceptions/missingRequiredDataException";

describe("TaskStatusController", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    const createMockResponse = () => {
        const res = {
            status: vi.fn(),
            json: vi.fn(),
            send: vi.fn(),
        } as unknown as Response;

        vi.mocked(res.status).mockReturnValue(res);
        vi.mocked(res.json).mockReturnValue(res);
        vi.mocked(res.send).mockReturnValue(res);

        return res;
    };

    const createMockNext = () => vi.fn() as unknown as NextFunction;

    describe("createTaskStatus", () => {
        it("should create a task status and return 201", async () => {
            const req = {
                userId: "user-1",
                params: {
                    projectId: "project-1",
                },
                body: {
                    status: "Review",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            const taskStatus = {
                projectId: "project-1",
                status: "review",
                order: 4,
            };

            vi.spyOn(TaskStatusService, "createTaskStatus")
                .mockResolvedValue(taskStatus as any);

            await TaskStatusController.createTaskStatus(req, res, next);

            expect(TaskStatusService.createTaskStatus).toHaveBeenCalledWith(
                "user-1",
                "project-1",
                {
                    status: "Review",
                }
            );

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(taskStatus);
            expect(next).not.toHaveBeenCalled();
        });

        it("should call next with ForbiddenException when userId is missing", async () => {
            const req = {
                params: {
                    projectId: "project-1",
                },
                body: {
                    status: "Review",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            await TaskStatusController.createTaskStatus(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.any(ForbiddenException)
            );
        });

        it("should call next with MissingRequiredDataException when projectId is missing", async () => {
            const req = {
                userId: "user-1",
                params: {},
                body: {
                    status: "Review",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            await TaskStatusController.createTaskStatus(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.any(MissingRequiredDataException)
            );
        });

        it("should call next when projectId is not a string", async () => {
            const req = {
                userId: "user-1",
                params: {
                    projectId: 123,
                },
                body: {
                    status: "Review",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            await TaskStatusController.createTaskStatus(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.any(MissingRequiredDataException)
            );
        });

        it("should call next when request body is missing", async () => {
            const req = {
                userId: "user-1",
                params: {
                    projectId: "project-1",
                },
                body: undefined,
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            await TaskStatusController.createTaskStatus(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.any(MissingRequiredDataException)
            );
        });

        it("should call next when request body is not an object", async () => {
            const req = {
                userId: "user-1",
                params: {
                    projectId: "project-1",
                },
                body: "invalid",
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            await TaskStatusController.createTaskStatus(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.any(MissingRequiredDataException)
            );
        });

        it("should call next when status is missing", async () => {
            const req = {
                userId: "user-1",
                params: {
                    projectId: "project-1",
                },
                body: {},
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            await TaskStatusController.createTaskStatus(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.any(MissingRequiredDataException)
            );
        });

        it("should forward service errors to next", async () => {
            const req = {
                userId: "user-1",
                params: {
                    projectId: "project-1",
                },
                body: {
                    status: "Review",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            const error = new Error("Service error");

            vi.spyOn(TaskStatusService, "createTaskStatus")
                .mockRejectedValue(error);

            await TaskStatusController.createTaskStatus(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getTaskStatusById", () => {
        it("should return the task status with 200", async () => {
            const req = {
                userId: "user-1",
                params: {
                    projectId: "project-1",
                    taskStatusId: "review",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            const taskStatus = {
                projectId: "project-1",
                status: "review",
                order: 4,
            };

            vi.spyOn(TaskStatusService, "getTaskStatusByPK")
                .mockResolvedValue(taskStatus as any);

            await TaskStatusController.getTaskStatusById(req, res, next);

            expect(
                TaskStatusService.getTaskStatusByPK
            ).toHaveBeenCalledWith(
                "user-1",
                "project-1",
                "review"
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(taskStatus);
            expect(next).not.toHaveBeenCalled();
        });

        it("should reject when userId is missing", async () => {
            const req = {
                params: {
                    projectId: "project-1",
                    taskStatusId: "review",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            await TaskStatusController.getTaskStatusById(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.any(ForbiddenException)
            );
        });

        it("should reject when projectId is missing", async () => {
            const req = {
                userId: "user-1",
                params: {
                    taskStatusId: "review",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            await TaskStatusController.getTaskStatusById(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.any(MissingRequiredDataException)
            );
        });

        it("should reject when taskStatusId is missing", async () => {
            const req = {
                userId: "user-1",
                params: {
                    projectId: "project-1",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            await TaskStatusController.getTaskStatusById(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.any(MissingRequiredDataException)
            );
        });

        it("should forward service errors to next", async () => {
            const req = {
                userId: "user-1",
                params: {
                    projectId: "project-1",
                    taskStatusId: "review",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            const error = new Error("Service error");

            vi.spyOn(TaskStatusService, "getTaskStatusByPK")
                .mockRejectedValue(error);

            await TaskStatusController.getTaskStatusById(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getTaskStatusesByProjectId", () => {
        it("should return task statuses with 200", async () => {
            const req = {
                userId: "user-1",
                params: {
                    projectId: "project-1",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

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
            ];

            vi.spyOn(TaskStatusService, "getTaskStatusesByProjectId")
                .mockResolvedValue(taskStatuses as any);

            await TaskStatusController.getTaskStatusesByProjectId(
                req,
                res,
                next
            );

            expect(
                TaskStatusService.getTaskStatusesByProjectId
            ).toHaveBeenCalledWith(
                "user-1",
                "project-1"
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(taskStatuses);
            expect(next).not.toHaveBeenCalled();
        });

        it("should reject when userId is missing", async () => {
            const req = {
                params: {
                    projectId: "project-1",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            await TaskStatusController.getTaskStatusesByProjectId(
                req,
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.any(ForbiddenException)
            );
        });

        it("should reject when projectId is missing", async () => {
            const req = {
                userId: "user-1",
                params: {},
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            await TaskStatusController.getTaskStatusesByProjectId(
                req,
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.any(MissingRequiredDataException)
            );
        });

        it("should forward service errors to next", async () => {
            const req = {
                userId: "user-1",
                params: {
                    projectId: "project-1",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            const error = new Error("Service error");

            vi.spyOn(TaskStatusService, "getTaskStatusesByProjectId")
                .mockRejectedValue(error);

            await TaskStatusController.getTaskStatusesByProjectId(
                req,
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("updateTaskStatus", () => {
        it("should update a task status and return 200", async () => {
            const req = {
                userId: "user-1",
                params: {
                    projectId: "project-1",
                    taskStatusId: "review",
                },
                body: {
                    status: "Testing",
                    order: 5,
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            const taskStatus = {
                projectId: "project-1",
                status: "testing",
                order: 5,
            };

            vi.spyOn(TaskStatusService, "updateTaskStatus")
                .mockResolvedValue(taskStatus as any);

            await TaskStatusController.updateTaskStatus(
                req,
                res,
                next
            );

            expect(
                TaskStatusService.updateTaskStatus
            ).toHaveBeenCalledWith(
                "user-1",
                "project-1",
                "review",
                {
                    status: "Testing",
                    order: 5,
                }
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(taskStatus);
            expect(next).not.toHaveBeenCalled();
        });

        it("should update only the status", async () => {
            const req = {
                userId: "user-1",
                params: {
                    projectId: "project-1",
                    taskStatusId: "review",
                },
                body: {
                    status: "Testing",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            vi.spyOn(TaskStatusService, "updateTaskStatus")
                .mockResolvedValue({} as any);

            await TaskStatusController.updateTaskStatus(
                req,
                res,
                next
            );

            expect(
                TaskStatusService.updateTaskStatus
            ).toHaveBeenCalledWith(
                "user-1",
                "project-1",
                "review",
                {
                    status: "Testing",
                    order: undefined,
                }
            );
        });

        it("should update only the order", async () => {
            const req = {
                userId: "user-1",
                params: {
                    projectId: "project-1",
                    taskStatusId: "review",
                },
                body: {
                    order: 5,
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            vi.spyOn(TaskStatusService, "updateTaskStatus")
                .mockResolvedValue({} as any);

            await TaskStatusController.updateTaskStatus(
                req,
                res,
                next
            );

            expect(
                TaskStatusService.updateTaskStatus
            ).toHaveBeenCalledWith(
                "user-1",
                "project-1",
                "review",
                {
                    status: undefined,
                    order: 5,
                }
            );
        });

        it("should reject when userId is missing", async () => {
            const req = {
                params: {
                    projectId: "project-1",
                    taskStatusId: "review",
                },
                body: {
                    status: "Testing",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            await TaskStatusController.updateTaskStatus(
                req,
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.any(ForbiddenException)
            );
        });

        it("should reject when projectId is missing", async () => {
            const req = {
                userId: "user-1",
                params: {
                    taskStatusId: "review",
                },
                body: {
                    status: "Testing",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            await TaskStatusController.updateTaskStatus(
                req,
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.any(MissingRequiredDataException)
            );
        });

        it("should reject when taskStatusId is missing", async () => {
            const req = {
                userId: "user-1",
                params: {
                    projectId: "project-1",
                },
                body: {
                    status: "Testing",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            await TaskStatusController.updateTaskStatus(
                req,
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.any(MissingRequiredDataException)
            );
        });

        it("should reject when no update fields are provided", async () => {
            const req = {
                userId: "user-1",
                params: {
                    projectId: "project-1",
                    taskStatusId: "review",
                },
                body: {},
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            await TaskStatusController.updateTaskStatus(
                req,
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.any(MissingRequiredDataException)
            );
        });

        it("should forward service errors to next", async () => {
            const req = {
                userId: "user-1",
                params: {
                    projectId: "project-1",
                    taskStatusId: "review",
                },
                body: {
                    status: "Testing",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            const error = new Error("Service error");

            vi.spyOn(TaskStatusService, "updateTaskStatus")
                .mockRejectedValue(error);

            await TaskStatusController.updateTaskStatus(
                req,
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("deleteTaskStatus", () => {
        it("should delete a task status and return 204", async () => {
            const req = {
                userId: "user-1",
                params: {
                    projectId: "project-1",
                    taskStatusId: "review",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            vi.spyOn(TaskStatusService, "deleteTaskStatus")
                .mockResolvedValue(1);

            await TaskStatusController.deleteTaskStatus(
                req,
                res,
                next
            );

            expect(
                TaskStatusService.deleteTaskStatus
            ).toHaveBeenCalledWith(
                "user-1",
                "project-1",
                "review"
            );

            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it("should reject when userId is missing", async () => {
            const req = {
                params: {
                    projectId: "project-1",
                    taskStatusId: "review",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            await TaskStatusController.deleteTaskStatus(
                req,
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.any(ForbiddenException)
            );
        });

        it("should reject when projectId is missing", async () => {
            const req = {
                userId: "user-1",
                params: {
                    taskStatusId: "review",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            await TaskStatusController.deleteTaskStatus(
                req,
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.any(MissingRequiredDataException)
            );
        });

        it("should reject when taskStatusId is missing", async () => {
            const req = {
                userId: "user-1",
                params: {
                    projectId: "project-1",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            await TaskStatusController.deleteTaskStatus(
                req,
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.any(MissingRequiredDataException)
            );
        });

        it("should forward service errors to next", async () => {
            const req = {
                userId: "user-1",
                params: {
                    projectId: "project-1",
                    taskStatusId: "review",
                },
            } as unknown as Request;

            const res = createMockResponse();
            const next = createMockNext();

            const error = new Error("Service error");

            vi.spyOn(TaskStatusService, "deleteTaskStatus")
                .mockRejectedValue(error);

            await TaskStatusController.deleteTaskStatus(
                req,
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});