import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";
import taskHistoryRouter from "../../src/routes/taskHistoryRouter";
import NotFoundException from "../../src/exceptions/notFoundException";

const mocks = vi.hoisted(() => ({
    getTaskHistory: vi.fn(),
    checkUser: vi.fn(),
}));

vi.mock("../../src/services/taskHistoryService", () => ({
    default: {
        getTaskHistory: mocks.getTaskHistory,
    },
}));

vi.mock("../../src/middlewares/checkUser", () => ({
    default: mocks.checkUser,
}));

const app = express();

app.use(
    "/api/projects/:projectId/tasks/:taskId/history",
    mocks.checkUser,
    taskHistoryRouter,
);

describe("Task History Router", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.checkUser.mockImplementation((req, res, next) => {
            req.userId = "user-id";
            req.tokenPurpose = "accessToken";
            next();
        });
    });

    describe("GET /api/projects/:projectId/tasks/:taskId/history", () => {
        it("should return task history successfully", async () => {
            const taskHistory = [
                {
                    id: "history-1",
                    taskId: "task-1",
                    fieldName: "title",
                    oldValue: "Old title",
                    newValue: "New title",
                    actionType: "UPDATED",
                },
                {
                    id: "history-2",
                    taskId: "task-1",
                    fieldName: "description",
                    oldValue: "Old description",
                    newValue: "New description",
                    actionType: "UPDATED",
                },
            ];

            mocks.getTaskHistory.mockResolvedValue(taskHistory);

            const response = await request(app)
                .get(
                    "/api/projects/project-1/tasks/task-1/history",
                );

            expect(response.status).toBe(200);
            expect(response.body).toEqual(taskHistory);

            expect(mocks.getTaskHistory).toHaveBeenCalledTimes(1);
            expect(mocks.getTaskHistory).toHaveBeenCalledWith(
                "user-id",
                "project-1",
                "task-1",
            );
        });

        it("should return 404 if the task history is not found", async () => {
            mocks.getTaskHistory.mockRejectedValue(
                new NotFoundException("Task not found."),
            );

            const response = await request(app)
                .get(
                    "/api/projects/project-1/tasks/task-1/history",
                );

            expect(response.status).toBe(404);

            expect(mocks.getTaskHistory).toHaveBeenCalledTimes(1);
            expect(mocks.getTaskHistory).toHaveBeenCalledWith(
                "user-id",
                "project-1",
                "task-1",
            );
        });
    });

    describe("Authentication", () => {
        it("should return 403 if user ID is missing", async () => {
            mocks.checkUser.mockImplementation((req, res, next) => {
                next();
            });

            const response = await request(app)
                .get(
                    "/api/projects/project-1/tasks/task-1/history",
                );

            expect(response.status).toBe(403);

            expect(mocks.getTaskHistory).not.toHaveBeenCalled();
        });
    });

    describe("Invalid parameters", () => {
        it("should return 400 if projectId is missing", async () => {
            const response = await request(app)
                .get("/api/projects//tasks/task-1/history");

            expect(response.status).toBe(404);
            expect(mocks.getTaskHistory).not.toHaveBeenCalled();
        });

        it("should return 400 if taskId is missing", async () => {
            const response = await request(app)
                .get("/api/projects/project-1/tasks//history");

            expect(response.status).toBe(404);
            expect(mocks.getTaskHistory).not.toHaveBeenCalled();
        });
    });

    describe("Unknown routes", () => {
        it("should return 404 for an unknown task history route", async () => {
            const response = await request(app)
                .get(
                    "/api/projects/project-1/tasks/task-1/history/unknown",
                );

            expect(response.status).toBe(404);
        });
    });
});