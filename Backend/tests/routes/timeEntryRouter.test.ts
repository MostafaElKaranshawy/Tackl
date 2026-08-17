import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";
import timeEntryRouter from "../../src/routes/timeEntryRouter";
import NotFoundException from "../../src/exceptions/notFoundException";

const mocks = vi.hoisted(() => ({
    createTimeEntry: vi.fn(),
    getTaskTimeEntries: vi.fn(),
    getTimeEntryById: vi.fn(),
    updateTimeEntry: vi.fn(),
    deleteTimeEntry: vi.fn(),
    checkUser: vi.fn(),
}));

vi.mock("../../src/services/timeEntryService", () => ({
    default: {
        createTimeEntry: mocks.createTimeEntry,
        getTaskTimeEntries: mocks.getTaskTimeEntries,
        getTimeEntryById: mocks.getTimeEntryById,
        updateTimeEntry: mocks.updateTimeEntry,
        deleteTimeEntry: mocks.deleteTimeEntry,
    },
}));

const app = express();

app.use(express.json());

app.use(
    "/api/projects/:projectId/tasks/:taskId/time-entries",
    mocks.checkUser,
    timeEntryRouter,
);

describe("Time Entry Router", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.checkUser.mockImplementation((req, res, next) => {
            req.userId = "user-id";
            req.tokenPurpose = "accessToken";
            next();
        });
    });

    describe("POST /api/projects/:projectId/tasks/:taskId/time-entries", () => {
        it("should create a time entry and return 201 status", async () => {
            const timeEntry = {
                id: "time-entry-id",
                duration: 90,
                date: "2026-08-16",
                note: "Worked on task",
            };

            mocks.createTimeEntry.mockResolvedValue(timeEntry);

            const response = await request(app)
                .post(
                    "/api/projects/project-id/tasks/task-id/time-entries",
                )
                .send({
                    duration: 90,
                    date: "2026-08-16",
                    note: "Worked on task",
                });

            expect(response.status).toBe(201);
            expect(response.body).toEqual(timeEntry);

            expect(mocks.createTimeEntry).toHaveBeenCalledTimes(1);
            expect(mocks.createTimeEntry).toHaveBeenCalledWith(
                "user-id",
                "project-id",
                "task-id",
                {
                    duration: 90,
                    date: "2026-08-16",
                    note: "Worked on task",
                },
            );
        });

        it("should return 400 if required data is missing", async () => {
            const response = await request(app)
                .post(
                    "/api/projects/project-id/tasks/task-id/time-entries",
                )
                .send({
                    duration: 90,
                });

            expect(response.status).toBe(400);

            expect(mocks.createTimeEntry).not.toHaveBeenCalled();
        });
    });

    describe("GET /api/projects/:projectId/tasks/:taskId/time-entries", () => {
        it("should return all time entries for a task", async () => {
            const timeEntries = [
                {
                    id: "1",
                    duration: 90,
                    date: "2026-08-16",
                    note: "Worked on task",
                },
                {
                    id: "2",
                    duration: 45,
                    date: "2026-08-15",
                    note: "More work",
                },
            ];

            mocks.getTaskTimeEntries.mockResolvedValue(timeEntries);

            const response = await request(app)
                .get(
                    "/api/projects/project-id/tasks/task-id/time-entries",
                );

            expect(response.status).toBe(200);
            expect(response.body).toEqual(timeEntries);

            expect(mocks.getTaskTimeEntries).toHaveBeenCalledTimes(1);
            expect(mocks.getTaskTimeEntries).toHaveBeenCalledWith(
                "user-id",
                "project-id",
                "task-id",
            );
        });
    });

    describe("GET /api/projects/:projectId/tasks/:taskId/time-entries/:timeEntryId", () => {
        it("should return a time entry by ID", async () => {
            const timeEntry = {
                id: "time-entry-id",
                duration: 90,
                date: "2026-08-16",
                note: "Worked on task",
            };

            mocks.getTimeEntryById.mockResolvedValue(timeEntry);

            const response = await request(app)
                .get(
                    "/api/projects/project-id/tasks/task-id/time-entries/time-entry-id",
                );

            expect(response.status).toBe(200);
            expect(response.body).toEqual(timeEntry);

            expect(mocks.getTimeEntryById).toHaveBeenCalledTimes(1);
            expect(mocks.getTimeEntryById).toHaveBeenCalledWith(
                "time-entry-id",
                "user-id",
                "project-id",
                "task-id",
            );
        });

        it("should return 404 if the time entry does not exist", async () => {
            mocks.getTimeEntryById.mockResolvedValue(null);

            const response = await request(app)
                .get(
                    "/api/projects/project-id/tasks/task-id/time-entries/time-entry-id",
                );

            expect(response.status).toBe(404);

            expect(mocks.getTimeEntryById).toHaveBeenCalledWith(
                "time-entry-id",
                "user-id",
                "project-id",
                "task-id",
            );
        });
    });

    describe("PUT /api/projects/:projectId/tasks/:taskId/time-entries/:timeEntryId", () => {
        it("should update a time entry and return 200 status", async () => {
            const updatedTimeEntry = {
                id: "time-entry-id",
                duration: 120,
                date: "2026-08-16",
                note: "Updated note",
            };

            mocks.updateTimeEntry.mockResolvedValue(updatedTimeEntry);

            const response = await request(app)
                .put(
                    "/api/projects/project-id/tasks/task-id/time-entries/time-entry-id",
                )
                .send({
                    duration: 120,
                    date: "2026-08-16",
                    note: "Updated note",
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedTimeEntry);

            expect(mocks.updateTimeEntry).toHaveBeenCalledTimes(1);
            expect(mocks.updateTimeEntry).toHaveBeenCalledWith(
                "user-id",
                "project-id",
                "task-id",
                "time-entry-id",
                {
                    duration: 120,
                    date: "2026-08-16",
                    note: "Updated note",
                },
            );
        });

        it("should return 400 if no update fields are provided", async () => {
            const response = await request(app)
                .put(
                    "/api/projects/project-id/tasks/task-id/time-entries/time-entry-id",
                )
                .send({});
            expect(response.status).toBe(400);

            expect(mocks.updateTimeEntry).not.toHaveBeenCalled();
        });
    });

    describe("DELETE /api/projects/:projectId/tasks/:taskId/time-entries/:timeEntryId", () => {
        it("should delete a time entry and return 204 status", async () => {
            mocks.deleteTimeEntry.mockResolvedValue(undefined);

            const response = await request(app)
                .delete(
                    "/api/projects/project-id/tasks/task-id/time-entries/time-entry-id",
                );

            expect(response.status).toBe(204);

            expect(mocks.deleteTimeEntry).toHaveBeenCalledTimes(1);
            expect(mocks.deleteTimeEntry).toHaveBeenCalledWith(
                "user-id",
                "project-id",
                "task-id",
                "time-entry-id",
            );
        });

        it("should return 404 if the time entry does not exist", async () => {
            mocks.deleteTimeEntry.mockRejectedValue(
                new NotFoundException("Time entry not found."),
            );

            const response = await request(app)
                .delete(
                    "/api/projects/project-id/tasks/task-id/time-entries/time-entry-id",
                );

            expect(response.status).toBe(404);

            expect(mocks.deleteTimeEntry).toHaveBeenCalledWith(
                "user-id",
                "project-id",
                "task-id",
                "time-entry-id",
            );
        });
    });

    describe("Unknown routes", () => {
        it("should return 404 for an unknown time entry route", async () => {
            const response = await request(app)
                .get(
                    "/api/projects/project-id/tasks/task-id/time-entries/does-not-exist/unknown",
                );

            expect(response.status).toBe(404);
        });
    });
});