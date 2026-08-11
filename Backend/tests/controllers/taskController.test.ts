import { afterEach, describe, expect, it, vi } from "vitest";
import { Request, Response, NextFunction } from "express";

import TaskController from "../../src/controllers/taskController";
import TaskService from "../../src/services/taskService";
import Task from "../../src/models/task";

import ForbiddenException from "../../src/exceptions/forbiddenException";
import MissingRequiredDataException from "../../src/exceptions/missingRequiredDataException";
import { checkQueryParams } from "../../src/utils/checkQueryParams";

describe("TaskController", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Create a new valid task", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
            },
            body: {
                title: "Test Task",
                description: "Test description",
                status: "todo",
                priority: "medium",
                estimatedTime: 60,
                dueDate: "2026-08-20",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        const mockTask = {
            id: "task-1",
            title: "Test Task",
            description: "Test description",
            status: "todo",
            priority: "medium",
            estimatedTime: 60,
            dueDate: new Date("2026-08-20"),
            projectId: "project-1",
        } as Task;

        vi.spyOn(TaskService, "createTask").mockResolvedValue(mockTask);

        await TaskController.createTask(req, res, next);

        expect(TaskService.createTask).toHaveBeenCalledWith(
            {
                title: "Test Task",
                description: "Test description",
                status: "todo",
                priority: "medium",
                estimatedTime: 60,
                dueDate: expect.any(Date),
            },
            "project-1",
            "user-1"
        );

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockTask);
        expect(next).not.toHaveBeenCalled();
    });

    it("Create task without user ID", async () => {
        const req = {
            userId: undefined,
            params: {
                projectId: "project-1",
            },
            body: {
                title: "Test Task",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        await TaskController.createTask(req, res, next);
        expect(next).toHaveBeenCalledWith(
            expect.any(ForbiddenException)
        );
    });

    it("Create task without title", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
            },
            body: {
                description: "Test description",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        await TaskController.createTask(req, res, next);
        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Create task without project ID", async () => {
        const req = {
            userId: "user-1",
            params: {},
            body: {
                title: "Test Task",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        await TaskController.createTask(req, res, next);
        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Create task with invalid due date", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
            },
            body: {
                title: "Test Task",
                dueDate: "invalid-date",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        await TaskController.createTask(req, res, next);
        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Create task with default values", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
            },
            body: {
                title: "Test Task",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        vi.spyOn(TaskService, "createTask").mockResolvedValue({
            id: "task-1",
            title: "Test Task",
        } as Task);

        await TaskController.createTask(req, res, next);

        expect(TaskService.createTask).toHaveBeenCalledWith(
            {
                title: "Test Task",
                description: null,
                status: "todo",
                priority: "medium",
                estimatedTime: null,
                dueDate: null,
            },
            "project-1",
            "user-1"
        );

        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("Get a task by valid ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        const mockTask = {
            id: "task-1",
            title: "Test Task",
            projectId: "project-1",
        } as Task;

        vi.spyOn(TaskService, "getTaskById").mockResolvedValue(mockTask);

        await TaskController.getTaskById(req, res, next);

        expect(TaskService.getTaskById).toHaveBeenCalledWith(
            "project-1",
            "task-1",
            "user-1"
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockTask);
        expect(next).not.toHaveBeenCalled();
    });

    it("Get task without user ID", async () => {
        const req = {
            userId: undefined,
            params: {
                projectId: "project-1",
                taskId: "task-1",
            },
        } as unknown as Request;

        const res = {} as Response;
        const next = vi.fn() as NextFunction;

        await TaskController.getTaskById(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(ForbiddenException)
        );
    });

    it("Get task without project ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                taskId: "task-1",
            },
        } as unknown as Request;

        const res = {} as Response;
        const next = vi.fn() as NextFunction;

        await TaskController.getTaskById(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Get task without task ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
            },
        } as unknown as Request;

        const res = {} as Response;
        const next = vi.fn() as NextFunction;

        await TaskController.getTaskById(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Update a task successfully", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
            },
            body: {
                title: "Updated Task",
                description: "Updated description",
                status: "in_progress",
                priority: "high",
                estimatedTime: 120,
                dueDate: "2026-08-25",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        const mockTask = {
            id: "task-1",
            title: "Updated Task",
            projectId: "project-1",
        } as Task;

        vi.spyOn(TaskService, "updateTask").mockResolvedValue(mockTask);

        await TaskController.updateTask(req, res, next);

        expect(TaskService.updateTask).toHaveBeenCalledWith(
            "project-1",
            "task-1",
            {
                title: "Updated Task",
                description: "Updated description",
                status: "in_progress",
                priority: "high",
                estimatedTime: 120,
                dueDate: expect.any(Date),
            },
            "user-1"
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockTask);
        expect(next).not.toHaveBeenCalled();
    });

    it("Update a task without user ID", async () => {
        const req = {
            userId: undefined,
            params: {
                projectId: "project-1",
                taskId: "task-1",
            },
            body: {
                title: "Updated Task",
            },
        } as unknown as Request;

        const res = {} as Response;
        const next = vi.fn() as NextFunction;

        await TaskController.updateTask(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(ForbiddenException)
        );
    });

    it("Update a task without project ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                taskId: "task-1",
            },
            body: {
                title: "Updated Task",
            },
        } as unknown as Request;

        const res = {} as Response;
        const next = vi.fn() as NextFunction;

        await TaskController.updateTask(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Update a task without task ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
            },
            body: {
                title: "Updated Task",
            },
        } as unknown as Request;

        const res = {} as Response;
        const next = vi.fn() as NextFunction;

        await TaskController.updateTask(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Update a task with invalid due date", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
            },
            body: {
                dueDate: "invalid-date",
            },
        } as unknown as Request;

        const res = {} as Response;
        const next = vi.fn() as NextFunction;

        await TaskController.updateTask(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Update a task with only one field", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
            },
            body: {
                title: "Updated Task",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        vi.spyOn(TaskService, "updateTask").mockResolvedValue({
            id: "task-1",
            title: "Updated Task",
        } as Task);

        await TaskController.updateTask(req, res, next);

        expect(TaskService.updateTask).toHaveBeenCalledWith(
            "project-1",
            "task-1",
            {
                title: "Updated Task",
            },
            "user-1"
        );

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("Delete a task successfully", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        vi.spyOn(TaskService, "deleteTask").mockResolvedValue();

        await TaskController.deleteTask(req, res, next);

        expect(TaskService.deleteTask).toHaveBeenCalledWith(
            "project-1",
            "task-1",
            "user-1"
        );

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();

        expect(next).not.toHaveBeenCalled();
    });

    it("Delete task without user ID", async () => {
        const req = {
            userId: undefined,
            params: {
                projectId: "project-1",
                taskId: "task-1",
            },
        } as unknown as Request;

        const res = {} as Response;
        const next = vi.fn() as NextFunction;

        await TaskController.deleteTask(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(ForbiddenException)
        );
    });

    it("Delete task without project ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                taskId: "task-1",
            },
        } as unknown as Request;

        const res = {} as Response;
        const next = vi.fn() as NextFunction;

        await TaskController.deleteTask(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Delete task without task ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
            },
        } as unknown as Request;

        const res = {} as Response;
        const next = vi.fn() as NextFunction;

        await TaskController.deleteTask(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Get project tasks successfully", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
            },
            query: {
                page: "1",
                limit: "10",
                sortBy: "createdAt",
                sortOrder: "asc",
                search: "test",
                status: "todo",
                priority: "medium",
                overdue: "true",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        const mockResult = {
            tasks: [],
            total: 0,
        };

        vi.spyOn(TaskService, "getProjectTasks").mockResolvedValue(mockResult);

        vi.spyOn(
            await import("../../src/utils/checkQueryParams"),
            "checkQueryParams"
        ).mockImplementation(() => undefined);

        await TaskController.getProjectTasks(req, res, next);

        expect(TaskService.getProjectTasks).toHaveBeenCalledWith(
            "project-1",
            "user-1",
            {
                page: 1,
                limit: 10,
                sortBy: "createdAt",
                sortOrder: "asc",
                search: "test",
                filterStatus: "todo",
                filterPriority: "medium",
                filterOverDue: true,
            }
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockResult);
        expect(next).not.toHaveBeenCalled();
    });

    it("Get project tasks with default query parameters", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
            },
            query: {},
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        vi.spyOn(TaskService, "getProjectTasks").mockResolvedValue({
            tasks: [],
            total: 0,
        });

        await TaskController.getProjectTasks(req, res, next);

        expect(TaskService.getProjectTasks).toHaveBeenCalledWith(
            "project-1",
            "user-1",
            {
                page: undefined,
                limit: undefined,
                sortBy: "createdAt",
                sortOrder: "asc",
                search: undefined,
                filterStatus: undefined,
                filterPriority: undefined,
                filterOverDue: undefined,
            }
        );

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("Get project tasks without user ID", async () => {
        const req = {
            userId: undefined,
            params: {
                projectId: "project-1",
            },
            query: {},
        } as unknown as Request;

        const res = {} as Response;
        const next = vi.fn() as NextFunction;

        await TaskController.getProjectTasks(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(ForbiddenException)
        );
    });

    it("Get project tasks without project ID", async () => {
        const req = {
            userId: "user-1",
            params: {},
            query: {},
        } as unknown as Request;

        const res = {} as Response;
        const next = vi.fn() as NextFunction;

        await TaskController.getProjectTasks(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Get project tasks with invalid query parameters", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
            },
            query: {
                status: "invalid-status",
            },
        } as unknown as Request;

        const res = {} as Response;
        const next = vi.fn() as NextFunction;

        await TaskController.getProjectTasks(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it("Get all project tasks successfully", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
            },
            query: {
                sortBy: "title",
                sortOrder: "desc",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        const mockTasks = [
            {
                id: "task-1",
                title: "Task 1",
                projectId: "project-1",
            },
            {
                id: "task-2",
                title: "Task 2",
                projectId: "project-1",
            },
        ] as Task[];

        vi.spyOn(TaskService, "getAllProjectTasks").mockResolvedValue(
            mockTasks
        );

        await TaskController.getAllProjectTasks(req, res, next);

        expect(TaskService.getAllProjectTasks).toHaveBeenCalledWith(
            "project-1",
            "user-1",
            "title",
            "desc"
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockTasks);
        expect(next).not.toHaveBeenCalled();
    });

    it("Get all project tasks with default query parameters", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
            },
            query: {},
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        vi.spyOn(TaskService, "getAllProjectTasks").mockResolvedValue([]);

        await TaskController.getAllProjectTasks(req, res, next);

        expect(TaskService.getAllProjectTasks).toHaveBeenCalledWith(
            "project-1",
            "user-1",
            "createdAt",
            "asc"
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    it("Get all project tasks without user ID", async () => {
        const req = {
            userId: undefined,
            params: {
                projectId: "project-1",
            },
            query: {},
        } as unknown as Request;

        const res = {} as Response;
        const next = vi.fn() as NextFunction;

        await TaskController.getAllProjectTasks(req, res, next);
        expect(next).toHaveBeenCalledWith(
            expect.any(ForbiddenException)
        );
    });

    it("Get all project tasks without project ID", async () => {
        const req = {
            userId: "user-1",
            params: {},
            query: {},
        } as unknown as Request;

        const res = {} as Response;
        const next = vi.fn() as NextFunction;

        await TaskController.getAllProjectTasks(req, res, next);
        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Get all project tasks with invalid sortBy", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
            },
            query: {
                sortBy: "invalid",
            },
        } as unknown as Request;

        const res = {} as Response;
        const next = vi.fn() as NextFunction;

        await TaskController.getAllProjectTasks(req, res, next);
        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Get all project tasks with invalid sortOrder", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
            },
            query: {
                sortOrder: "invalid",
            },
        } as unknown as Request;

        const res = {} as Response;
        const next = vi.fn() as NextFunction;

        await TaskController.getAllProjectTasks(req, res, next);
        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Get all project tasks with every valid sortBy value", async () => {
        const sortValues = [
            "createdAt",
            "updatedAt",
            "title",
            "dueDate",
            "priority",
        ];

        for (const sortBy of sortValues) {
            const req = {
                userId: "user-1",
                params: {
                    projectId: "project-1",
                },
                query: {
                    sortBy,
                    sortOrder: "asc",
                },
            } as unknown as Request;

            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn(),
            } as unknown as Response;

            const next = vi.fn() as NextFunction;

            vi.spyOn(TaskService, "getAllProjectTasks").mockResolvedValue([]);

            await TaskController.getAllProjectTasks(req, res, next);

            expect(
                TaskService.getAllProjectTasks
            ).toHaveBeenCalledWith(
                "project-1",
                "user-1",
                sortBy,
                "asc"
            );

            vi.restoreAllMocks();
        }
    });
});