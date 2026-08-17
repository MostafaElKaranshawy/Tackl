import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";
import taskRouter from "../../src/routes/taskRouter";
import NotFoundException from "../../src/exceptions/notFoundException";

const mocks = vi.hoisted(() => ({
    createTask: vi.fn(),
    getTaskById: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    getProjectTasks: vi.fn(),
    getAllProjectTasks: vi.fn(),
    checkUser: vi.fn(),
}));

vi.mock("../../src/services/taskService", () => ({
    default: {
        createTask: mocks.createTask,
        getTaskById: mocks.getTaskById,
        updateTask: mocks.updateTask,
        deleteTask: mocks.deleteTask,
        getProjectTasks: mocks.getProjectTasks,
        getAllProjectTasks: mocks.getAllProjectTasks,
    },
}));

vi.mock("../../src/middlewares/checkUser", () => ({
    default: mocks.checkUser,
}));

const app = express();

app.use(express.json());

app.use(
    "/api/projects/:projectId/tasks",
    mocks.checkUser,
    taskRouter,
);

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(error.statusCode || 500).json({
        message: error.message,
    });
});

describe("Task Router", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.checkUser.mockImplementation((req, res, next) => {
            req.userId = "user-id";
            req.tokenPurpose = "accessToken";
            next();
        });
    });

    describe("POST /api/projects/:projectId/tasks", () => {
        it("should create a new task and return 201 status", async () => {
            const task = {
                id: "task-1",
                title: "Test Task",
                description: "Test description",
                status: "todo",
                priority: "medium",
                estimatedTime: 60,
                dueDate: null,
                projectId: "project-1",
            };

            mocks.createTask.mockResolvedValue(task);

            const response = await request(app)
                .post("/api/projects/project-1/tasks")
                .send({
                    title: "Test Task",
                    description: "Test description",
                    status: "todo",
                    priority: "medium",
                    estimatedTime: 60,
                });

            expect(response.status).toBe(201);
            expect(response.body).toEqual(task);

            expect(mocks.createTask).toHaveBeenCalledTimes(1);
            expect(mocks.createTask).toHaveBeenCalledWith(
                {
                    title: "Test Task",
                    description: "Test description",
                    status: "todo",
                    priority: "medium",
                    estimatedTime: 60,
                    dueDate: null,
                },
                "project-1",
                "user-id",
            );
        });

        it("should return 400 if title is missing", async () => {
            const response = await request(app)
                .post("/api/projects/project-1/tasks")
                .send({
                    description: "Test description",
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty(
                "message",
                "Missing required task data.",
            );

            expect(mocks.createTask).not.toHaveBeenCalled();
        });

        it("should return 400 if dueDate is invalid", async () => {
            const response = await request(app)
                .post("/api/projects/project-1/tasks")
                .send({
                    title: "Test Task",
                    dueDate: "invalid-date",
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty(
                "message",
                "Invalid due date format.",
            );

            expect(mocks.createTask).not.toHaveBeenCalled();
        });
    });

    describe("GET /api/projects/:projectId/tasks", () => {
        it("should return paginated project tasks", async () => {
            const tasks = [
                {
                    id: "task-1",
                    title: "Task 1",
                },
                {
                    id: "task-2",
                    title: "Task 2",
                },
            ];

            const result = {
                total: 2,
                tasks,
                page: 1,
                limit: 10,
            };

            mocks.getProjectTasks.mockResolvedValue(result);

            const response = await request(app)
                .get("/api/projects/project-1/tasks")
                .query({
                    page: 1,
                    limit: 10,
                    sortBy: "createdAt",
                    sortOrder: "asc",
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(result);

            expect(mocks.getProjectTasks).toHaveBeenCalledTimes(1);
            expect(mocks.getProjectTasks).toHaveBeenCalledWith(
                "project-1",
                "user-id",
                {
                    page: 1,
                    limit: 10,
                    sortBy: "createdAt",
                    sortOrder: "asc",
                    search: undefined,
                    filterStatus: undefined,
                    filterPriority: undefined,
                    filterOverDue: undefined,
                },
            );
        });

        it("should use default query parameters", async () => {
            mocks.getProjectTasks.mockResolvedValue({
                total: 0,
                tasks: [],
                page: 1,
                limit: 10,
            });

            const response = await request(app)
                .get("/api/projects/project-1/tasks");

            expect(response.status).toBe(200);

            expect(mocks.getProjectTasks).toHaveBeenCalledWith(
                "project-1",
                "user-id",
                {
                    page: undefined,
                    limit: undefined,
                    sortBy: "createdAt",
                    sortOrder: "asc",
                    search: undefined,
                    filterStatus: undefined,
                    filterPriority: undefined,
                    filterOverDue: undefined,
                },
            );
        });

        it("should pass search and filters to the service", async () => {
            mocks.getProjectTasks.mockResolvedValue({
                total: 1,
                tasks: [],
                page: 1,
                limit: 10,
            });

            const response = await request(app)
                .get("/api/projects/project-1/tasks")
                .query({
                    page: 2,
                    limit: 5,
                    sortBy: "title",
                    sortOrder: "desc",
                    search: "test",
                    status: "done",
                    priority: "high",
                    overdue: "true",
                });

            expect(response.status).toBe(200);

            expect(mocks.getProjectTasks).toHaveBeenCalledWith(
                "project-1",
                "user-id",
                {
                    page: 2,
                    limit: 5,
                    sortBy: "title",
                    sortOrder: "desc",
                    search: "test",
                    filterStatus: "done",
                    filterPriority: "high",
                    filterOverDue: true,
                },
            );
        });
    });

    describe("GET /api/projects/:projectId/tasks/all", () => {
        it("should return all project tasks", async () => {
            const tasks = [
                {
                    id: "task-1",
                    title: "Task 1",
                },
                {
                    id: "task-2",
                    title: "Task 2",
                },
            ];

            mocks.getAllProjectTasks.mockResolvedValue(tasks);

            const response = await request(app)
                .get("/api/projects/project-1/tasks/all");

            expect(response.status).toBe(200);
            expect(response.body).toEqual(tasks);

            expect(mocks.getAllProjectTasks).toHaveBeenCalledTimes(1);
            expect(mocks.getAllProjectTasks).toHaveBeenCalledWith(
                "project-1",
                "user-id",
                "createdAt",
                "asc",
            );
        });

        it("should pass sort parameters to the service", async () => {
            mocks.getAllProjectTasks.mockResolvedValue([]);

            const response = await request(app)
                .get("/api/projects/project-1/tasks/all")
                .query({
                    sortBy: "title",
                    sortOrder: "desc",
                });

            expect(response.status).toBe(200);

            expect(mocks.getAllProjectTasks).toHaveBeenCalledWith(
                "project-1",
                "user-id",
                "title",
                "desc",
            );
        });

        it("should return 400 for an invalid sortBy value", async () => {
            const response = await request(app)
                .get("/api/projects/project-1/tasks/all")
                .query({
                    sortBy: "invalid",
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty(
                "message",
                "Invalid sortBy value. Must be one of: createdAt, updatedAt, title, dueDate, priority.",
            );

            expect(mocks.getAllProjectTasks).not.toHaveBeenCalled();
        });

        it("should return 400 for an invalid sortOrder value", async () => {
            const response = await request(app)
                .get("/api/projects/project-1/tasks/all")
                .query({
                    sortOrder: "invalid",
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty(
                "message",
                "Invalid sortOrder value. Must be 'asc' or 'desc'.",
            );

            expect(mocks.getAllProjectTasks).not.toHaveBeenCalled();
        });

        it("should return 404 if the project does not exist", async () => {
            mocks.getAllProjectTasks.mockRejectedValue(
                new NotFoundException("Project not found."),
            );

            const response = await request(app)
                .get("/api/projects/project-1/tasks/all");

            expect(response.status).toBe(404);

            expect(mocks.getAllProjectTasks).toHaveBeenCalledWith(
                "project-1",
                "user-id",
                "createdAt",
                "asc",
            );
        });
    });

    describe("GET /api/projects/:projectId/tasks/:taskId", () => {
        it("should return a task by ID", async () => {
            const task = {
                id: "task-1",
                title: "Test Task",
                projectId: "project-1",
            };

            mocks.getTaskById.mockResolvedValue(task);

            const response = await request(app)
                .get("/api/projects/project-1/tasks/task-1");

            expect(response.status).toBe(200);
            expect(response.body).toEqual(task);

            expect(mocks.getTaskById).toHaveBeenCalledTimes(1);
            expect(mocks.getTaskById).toHaveBeenCalledWith(
                "project-1",
                "task-1",
                "user-id",
            );
        });

        it("should return 404 if the task does not exist", async () => {
            mocks.getTaskById.mockRejectedValue(
                new NotFoundException("Task not found."),
            );

            const response = await request(app)
                .get("/api/projects/project-1/tasks/task-1");

            expect(response.status).toBe(404);

            expect(mocks.getTaskById).toHaveBeenCalledWith(
                "project-1",
                "task-1",
                "user-id",
            );
        });
    });

    describe("PUT /api/projects/:projectId/tasks/:taskId", () => {
        it("should update a task and return 200 status", async () => {
            const updatedTask = {
                id: "task-1",
                title: "Updated Task",
                description: "Updated description",
                projectId: "project-1",
            };

            mocks.updateTask.mockResolvedValue(updatedTask);

            const response = await request(app)
                .put("/api/projects/project-1/tasks/task-1")
                .send({
                    title: "Updated Task",
                    description: "Updated description",
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedTask);

            expect(mocks.updateTask).toHaveBeenCalledTimes(1);
            expect(mocks.updateTask).toHaveBeenCalledWith(
                "project-1",
                "task-1",
                {
                    title: "Updated Task",
                    description: "Updated description",
                },
                "user-id",
            );
        });

        it("should update only the provided fields", async () => {
            mocks.updateTask.mockResolvedValue({
                id: "task-1",
                title: "Updated Task",
            });

            const response = await request(app)
                .put("/api/projects/project-1/tasks/task-1")
                .send({
                    title: "Updated Task",
                });

            expect(response.status).toBe(200);

            expect(mocks.updateTask).toHaveBeenCalledWith(
                "project-1",
                "task-1",
                {
                    title: "Updated Task",
                },
                "user-id",
            );
        });

        it("should return 400 if dueDate is invalid", async () => {
            const response = await request(app)
                .put("/api/projects/project-1/tasks/task-1")
                .send({
                    dueDate: "invalid-date",
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty(
                "message",
                "Invalid due date format.",
            );

            expect(mocks.updateTask).not.toHaveBeenCalled();
        });

        it("should return 404 if the task does not exist", async () => {
            mocks.updateTask.mockRejectedValue(
                new NotFoundException("Task not found."),
            );

            const response = await request(app)
                .put("/api/projects/project-1/tasks/task-1")
                .send({
                    title: "Updated Task",
                });

            expect(response.status).toBe(404);

            expect(mocks.updateTask).toHaveBeenCalledWith(
                "project-1",
                "task-1",
                {
                    title: "Updated Task",
                },
                "user-id",
            );
        });
    });

    describe("DELETE /api/projects/:projectId/tasks/:taskId", () => {
        it("should delete a task and return 204 status", async () => {
            mocks.deleteTask.mockResolvedValue(undefined);

            const response = await request(app)
                .delete("/api/projects/project-1/tasks/task-1");

            expect(response.status).toBe(204);

            expect(mocks.deleteTask).toHaveBeenCalledTimes(1);
            expect(mocks.deleteTask).toHaveBeenCalledWith(
                "project-1",
                "task-1",
                "user-id",
            );
        });

        it("should return 404 if the task does not exist", async () => {
            mocks.deleteTask.mockRejectedValue(
                new NotFoundException("Task not found."),
            );

            const response = await request(app)
                .delete("/api/projects/project-1/tasks/task-1");

            expect(response.status).toBe(404);

            expect(mocks.deleteTask).toHaveBeenCalledWith(
                "project-1",
                "task-1",
                "user-id",
            );
        });
    });

    describe("Authentication", () => {
        it("should return 403 if user ID is missing", async () => {
            mocks.checkUser.mockImplementation((req, res, next) => {
                next();
            });

            const response = await request(app)
                .get("/api/projects/project-1/tasks");

            expect(response.status).toBe(403);

            expect(mocks.getProjectTasks).not.toHaveBeenCalled();
        });
    });

    describe("Unknown routes", () => {
        it("should return 404 for an unknown task route", async () => {
            const response = await request(app)
                .get(
                    "/api/projects/project-1/tasks/task-1/unknown",
                );

            expect(response.status).toBe(404);
        });
    });
});