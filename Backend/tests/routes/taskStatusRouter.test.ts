import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";
import TaskStatusController from "../../src/controllers/taskStatusController";
import taskStatusRouter from "../../src/routes/taskStatusRouter";

vi.mock("../../src/controllers/taskStatusController", () => ({
    default: {
        createTaskStatus: vi.fn((req, res) => res.status(201).json({})),
        getTaskStatusesByProjectId: vi.fn((req, res) => res.status(200).json([])),
        getTaskStatusById: vi.fn((req, res) => res.status(200).json({})),
        updateTaskStatus: vi.fn((req, res) => res.status(200).json({})),
        deleteTaskStatus: vi.fn((req, res) => res.status(204).send()),
    },
}));

describe("TaskStatusRouter", () => {
    const app = express();

    app.use(express.json());
    app.use(
        "/api/projects/:projectId/task-statuses",
        taskStatusRouter
    );

    it("should create a task status", async () => {
        const response = await request(app)
            .post("/api/projects/project-1/task-statuses")
            .send({
                status: "review",
            });

        expect(response.status).toBe(201);

        expect(
            TaskStatusController.createTaskStatus
        ).toHaveBeenCalled();
    });

    it("should get all task statuses", async () => {
        const response = await request(app)
            .get("/api/projects/project-1/task-statuses");

        expect(response.status).toBe(200);

        expect(
            TaskStatusController.getTaskStatusesByProjectId
        ).toHaveBeenCalled();
    });

    it("should get a task status by status", async () => {
        const response = await request(app)
            .get(
                "/api/projects/project-1/task-statuses/in-progress"
            );

        expect(response.status).toBe(200);

        expect(
            TaskStatusController.getTaskStatusById
        ).toHaveBeenCalled();
    });

    it("should update a task status", async () => {
        const response = await request(app)
            .put(
                "/api/projects/project-1/task-statuses/in-progress"
            )
            .send({
                status: "testing",
            });

        expect(response.status).toBe(200);

        expect(
            TaskStatusController.updateTaskStatus
        ).toHaveBeenCalled();
    });

    it("should delete a task status", async () => {
        const response = await request(app)
            .delete(
                "/api/projects/project-1/task-statuses/in-progress"
            );

        expect(response.status).toBe(204);

        expect(
            TaskStatusController.deleteTaskStatus
        ).toHaveBeenCalled();
    });
});