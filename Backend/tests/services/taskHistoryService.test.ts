import { afterEach, assert, describe, expect, it, vi } from "vitest";
import TaskHistoryService from "../../src/services/taskHistoryService";
import TaskHistory from "../../src/models/taskHistory";
import TaskHistoryRepository from "../../src/repositories/taskHistoryRepository";
import TaskRepository from "../../src/repositories/taskRepository";
import ForbiddenException from "../../src/exceptions/forbiddenException";
import NotFoundException from "../../src/exceptions/notFoundException";
import { ActionType } from "../../src/enums/actionType";

describe("TaskHistoryService", () => {

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Get task history successfully", async () => {

        const mockTaskHistory = [
            {
                id: "history-1",
                taskId: "task-1",
                userId: "user-1",
                fieldName: "title",
                actionType: ActionType.UPDATED,
            },
            {
                id: "history-2",
                taskId: "task-1",
                userId: "user-1",
                fieldName: "description",
                actionType: ActionType.CREATED,
            },
        ] as TaskHistory[];

        vi.spyOn(TaskRepository, "getTaskById").mockResolvedValue({
            id: "task-1",
            projectId: "project-1",
            project: {
                userId: "user-1",
            },
        } as any);

        vi.spyOn(
            TaskHistoryRepository,
            "getTaskHistoryByTaskId"
        ).mockResolvedValue(mockTaskHistory);

        const result = await TaskHistoryService.getTaskHistory(
            "user-1",
            "project-1",
            "task-1"
        );

        expect(result).toEqual(mockTaskHistory);
    });


    it("Get task history with invalid task", async () => {

        vi.spyOn(
            TaskRepository,
            "getTaskById"
        ).mockResolvedValue(null);

        try {

            await TaskHistoryService.getTaskHistory(
                "user-1",
                "project-1",
                "task-1"
            );

            assert.fail(
                "Expected NotFoundException to be thrown"
            );

        } catch (error) {

            expect(error).toBeInstanceOf(
                NotFoundException
            );
        }
    });


    it("Get task history with a different project", async () => {

        vi.spyOn(TaskRepository, "getTaskById").mockResolvedValue({
            id: "task-1",
            projectId: "project-2",
            project: {
                userId: "user-1",
            },
        } as any);

        try {

            await TaskHistoryService.getTaskHistory(
                "user-1",
                "project-1",
                "task-1"
            );

            assert.fail(
                "Expected ForbiddenException to be thrown"
            );

        } catch (error) {

            expect(error).toBeInstanceOf(
                ForbiddenException
            );
        }
    });


    it("Get task history with a different user", async () => {

        vi.spyOn(TaskRepository, "getTaskById").mockResolvedValue({
            id: "task-1",
            projectId: "project-1",
            project: {
                userId: "user-2",
            },
        } as any);

        try {

            await TaskHistoryService.getTaskHistory(
                "user-1",
                "project-1",
                "task-1"
            );

            assert.fail(
                "Expected ForbiddenException to be thrown"
            );

        } catch (error) {

            expect(error).toBeInstanceOf(
                ForbiddenException
            );
        }
    });


    it("Get task history and verify repository calls", async () => {

        const mockTaskHistory = [
            {
                id: "history-1",
                taskId: "task-1",
                userId: "user-1",
                fieldName: "status",
                actionType: ActionType.UPDATED,
            },
        ] as TaskHistory[];

        const taskRepositorySpy = vi.spyOn(
            TaskRepository,
            "getTaskById"
        ).mockResolvedValue({
            id: "task-1",
            projectId: "project-1",
            project: {
                userId: "user-1",
            },
        } as any);

        const historyRepositorySpy = vi.spyOn(
            TaskHistoryRepository,
            "getTaskHistoryByTaskId"
        ).mockResolvedValue(mockTaskHistory);

        const result = await TaskHistoryService.getTaskHistory(
            "user-1",
            "project-1",
            "task-1"
        );

        expect(taskRepositorySpy).toHaveBeenCalledWith(
            "user-1",
            "project-1",
            "task-1"
        );

        expect(historyRepositorySpy).toHaveBeenCalledWith(
            "task-1"
        );

        expect(result).toEqual(mockTaskHistory);
    });

});