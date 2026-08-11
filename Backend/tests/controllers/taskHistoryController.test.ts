import { afterEach, assert, describe, expect, it, vi } from "vitest";
import TaskHistoryController from "../../src/controllers/taskHistoryController";
import TaskHistoryService from "../../src/services/taskHistoryService";
import ForbiddenException from "../../src/exceptions/forbiddenException";
import MissingRequiredDataException from "../../src/exceptions/missingRequiredDataException";
import type { Request, Response, NextFunction } from "express";

describe("TaskHistoryController", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    const createMockResponse = () => {
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as unknown as Response;

        return res;
    };

    const next = vi.fn() as unknown as NextFunction;

    it("Get task history successfully", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
            },
        } as unknown as Request;

        const res = createMockResponse();

        const mockTaskHistory = [
            {
                id: "history-1",
                taskId: "task-1",
                userId: "user-1",
                fieldName: "title",
                actionType: "updated",
            },
        ];

        vi.spyOn(TaskHistoryService, "getTaskHistory")
            .mockResolvedValue(mockTaskHistory as any);

        await TaskHistoryController.getTaskHistory(req, res, next);

        expect(TaskHistoryService.getTaskHistory).toHaveBeenCalledWith(
            "user-1",
            "project-1",
            "task-1"
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockTaskHistory);
    });

    it("Get task history without user ID", async () => {
        const req = {
            userId: undefined,
            params: {
                projectId: "project-1",
                taskId: "task-1",
            },
        } as unknown as Request;

        const res = createMockResponse();

        try {
            await TaskHistoryController.getTaskHistory(req, res, next);
            assert.fail("Expected ForbiddenException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenException);
        }
    });

    it("Get task history without project ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: undefined,
                taskId: "task-1",
            },
        } as unknown as Request;

        const res = createMockResponse();

        try {
            await TaskHistoryController.getTaskHistory(req, res, next);
            assert.fail("Expected MissingRequiredDataException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(MissingRequiredDataException);
        }
    });

    it("Get task history with an invalid project ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: 123,
                taskId: "task-1",
            },
        } as unknown as Request;

        const res = createMockResponse();

        try {
            await TaskHistoryController.getTaskHistory(req, res, next);
            assert.fail("Expected MissingRequiredDataException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(MissingRequiredDataException);
        }
    });

    it("Get task history without task ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: undefined,
            },
        } as unknown as Request;

        const res = createMockResponse();

        try {
            await TaskHistoryController.getTaskHistory(req, res, next);
            assert.fail("Expected MissingRequiredDataException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(MissingRequiredDataException);
        }
    });

    it("Get task history with an invalid task ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: 123,
            },
        } as unknown as Request;

        const res = createMockResponse();

        try {
            await TaskHistoryController.getTaskHistory(req, res, next);
            assert.fail("Expected MissingRequiredDataException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(MissingRequiredDataException);
        }
    });

    it("Passes service errors to next", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
            },
        } as unknown as Request;

        const res = createMockResponse();

        const error = new Error("Service error");

        vi.spyOn(TaskHistoryService, "getTaskHistory")
            .mockRejectedValue(error);

        await TaskHistoryController.getTaskHistory(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});