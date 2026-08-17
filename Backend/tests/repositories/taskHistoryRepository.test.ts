import { afterEach, assert, describe, expect, it, vi } from "vitest";
import DBException from "../../src/exceptions/dbException";
import TaskHistory from "../../src/models/taskHistory";
import TaskChange from "../../src/models/taskChange";
import TaskHistoryRepository from "../../src/repositories/taskHistoryRepository";
import { ActionType } from "../../src/enums/actionType";
import ChangeDTO from "../../src/dto/changeDTO";

describe("TaskHistoryRepository", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Create a task history without changes", async () => {
        vi.spyOn(TaskHistory, "create").mockResolvedValue({
            id: "1",
            taskId: "1",
            userId: "1",
            actionType: ActionType.CREATED,
            fieldName: "Task",
        } as TaskHistory);

        try {
            await TaskHistoryRepository.createTaskHistory(
                "1",
                "1",
                ActionType.CREATED,
                "Task",
                []
            );
        } catch {
            assert.fail("Expected no exception to be thrown");
        }
    });

    it("Create a task history with valid changes", async () => {
        vi.spyOn(TaskHistory, "create").mockResolvedValue({
            id: "1",
            taskId: "1",
            userId: "1",
            actionType: ActionType.UPDATED,
            fieldName: "Task",
        } as TaskHistory);

        vi.spyOn(TaskChange, "create").mockResolvedValue(
            {} as TaskChange
        );

        const changes: ChangeDTO[] = [
            {
                fieldName: "title",
                oldValue: "Old title",
                newValue: "New title",
                actionType: ActionType.UPDATED,
            },
        ];

        try {
            await TaskHistoryRepository.createTaskHistory(
                "1",
                "1",
                ActionType.UPDATED,
                "Task",
                changes
            );
        } catch {
            assert.fail("Expected no exception to be thrown");
        }

        expect(TaskChange.create).toHaveBeenCalledWith({
            taskHistoryId: "1",
            fieldName: "title",
            oldValue: "Old title",
            newValue: "New title",
            actionType: ActionType.UPDATED,
        }, undefined);
    });

    it("Create task history with multiple valid changes", async () => {
        vi.spyOn(TaskHistory, "create").mockResolvedValue({
            id: "1",
            taskId: "1",
            userId: "1",
            actionType: ActionType.UPDATED,
            fieldName: "Task",
        } as TaskHistory);

        vi.spyOn(TaskChange, "create").mockResolvedValue(
            {} as TaskChange
        );

        const changes: ChangeDTO[] = [
            {
                fieldName: "title",
                oldValue: "Old title",
                newValue: "New title",
                actionType: ActionType.UPDATED,
            },
            {
                fieldName: "description",
                oldValue: "Old description",
                newValue: "New description",
                actionType: ActionType.UPDATED,
            },
        ];

        await TaskHistoryRepository.createTaskHistory(
            "1",
            "1",
            ActionType.UPDATED,
            "Task",
            changes
        );

        expect(TaskChange.create).toHaveBeenCalledTimes(2);
    });

    it("Do not create task history when changes have no differences", async () => {
        const createTaskHistorySpy = vi.spyOn(TaskHistory, "create");

        const changes: ChangeDTO[] = [
            {
                fieldName: "title",
                oldValue: "Same title",
                newValue: "Same title",
                actionType: ActionType.UPDATED,
            },
        ];

        await TaskHistoryRepository.createTaskHistory(
            "1",
            "1",
            ActionType.UPDATED,
            "Task",
            changes
        );

        expect(createTaskHistorySpy).not.toHaveBeenCalled();
    });

    it("Skip a change when oldValue equals newValue", async () => {
        vi.spyOn(TaskHistory, "create").mockResolvedValue({
            id: "1",
            taskId: "1",
            userId: "1",
            actionType: ActionType.UPDATED,
            fieldName: "Task",
        } as TaskHistory);

        const taskChangeCreateSpy = vi
            .spyOn(TaskChange, "create")
            .mockResolvedValue({} as TaskChange);

        const changes: ChangeDTO[] = [
            {
                fieldName: "title",
                oldValue: "Same title",
                newValue: "Same title",
                actionType: ActionType.UPDATED,
            },
            {
                fieldName: "description",
                oldValue: "Old description",
                newValue: "New description",
                actionType: ActionType.UPDATED,
            },
        ];

        await TaskHistoryRepository.createTaskHistory(
            "1",
            "1",
            ActionType.UPDATED,
            "Task",
            changes
        );

        expect(taskChangeCreateSpy).toHaveBeenCalledTimes(1);
        expect(taskChangeCreateSpy).toHaveBeenCalledWith({
            taskHistoryId: "1",
            fieldName: "description",
            oldValue: "Old description",
            newValue: "New description",
            actionType: ActionType.UPDATED,
        }, undefined);
    });

    it("Skip a change without a field name", async () => {
        vi.spyOn(TaskHistory, "create").mockResolvedValue({
            id: "1",
            taskId: "1",
            userId: "1",
            actionType: ActionType.UPDATED,
            fieldName: "Task",
        } as TaskHistory);

        const taskChangeCreateSpy = vi
            .spyOn(TaskChange, "create")
            .mockResolvedValue({} as TaskChange);

        const changes = [
            {
                fieldName: "",
                oldValue: "Old",
                newValue: "New",
                actionType: ActionType.UPDATED,
            },
        ] as ChangeDTO[];

        await TaskHistoryRepository.createTaskHistory(
            "1",
            "1",
            ActionType.UPDATED,
            "Task",
            changes
        );

        expect(taskChangeCreateSpy).not.toHaveBeenCalled();
    });

    it("Skip a change without an action type", async () => {
        vi.spyOn(TaskHistory, "create").mockResolvedValue({
            id: "1",
            taskId: "1",
            userId: "1",
            actionType: ActionType.UPDATED,
            fieldName: "Task",
        } as TaskHistory);

        const taskChangeCreateSpy = vi
            .spyOn(TaskChange, "create")
            .mockResolvedValue({} as TaskChange);

        const changes = [
            {
                fieldName: "title",
                oldValue: "Old",
                newValue: "New",
                actionType: undefined,
            },
        ] as unknown as ChangeDTO[];

        await TaskHistoryRepository.createTaskHistory(
            "1",
            "1",
            ActionType.UPDATED,
            "Task",
            changes
        );

        expect(taskChangeCreateSpy).not.toHaveBeenCalled();
    });

    it("Return when changes array is empty", async () => {
        vi.spyOn(TaskHistory, "create").mockResolvedValue({
            id: "1",
            taskId: "1",
            userId: "1",
            actionType: ActionType.CREATED,
            fieldName: "Task",
        } as TaskHistory);

        await TaskHistoryRepository.createTaskHistory(
            "1",
            "1",
            ActionType.CREATED,
            "Task",
            []
        );
    });

    it("Create task history with null changes", async () => {
        vi.spyOn(TaskHistory, "create").mockResolvedValue({
            id: "1",
            taskId: "1",
            userId: "1",
            actionType: ActionType.CREATED,
            fieldName: "Task",
        } as TaskHistory);

        await TaskHistoryRepository.createTaskHistory(
            "1",
            "1",
            ActionType.CREATED,
            "Task",
            null as unknown as ChangeDTO[]
        );
    });

    it("Throw DBException when task history data is missing", async () => {
        try {
            await TaskHistoryRepository.createTaskHistory(
                "",
                "1",
                ActionType.CREATED,
                "Task",
                []
            );

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Throw DBException when user ID is missing", async () => {
        try {
            await TaskHistoryRepository.createTaskHistory(
                "1",
                "",
                ActionType.CREATED,
                "Task",
                []
            );

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Throw DBException when action type is missing", async () => {
        try {
            await TaskHistoryRepository.createTaskHistory(
                "1",
                "1",
                "" as ActionType,
                "Task",
                []
            );

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Throw DBException when field name is missing", async () => {
        try {
            await TaskHistoryRepository.createTaskHistory(
                "1",
                "1",
                ActionType.CREATED,
                "",
                []
            );

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Throw DBException when TaskHistory.create fails", async () => {
        vi.spyOn(TaskHistory, "create").mockRejectedValue(
            new Error("Database error")
        );

        try {
            await TaskHistoryRepository.createTaskHistory(
                "1",
                "1",
                ActionType.CREATED,
                "Task",
                []
            );

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Throw DBException when TaskChange.create fails", async () => {
        vi.spyOn(TaskHistory, "create").mockResolvedValue({
            id: "1",
            taskId: "1",
            userId: "1",
            actionType: ActionType.UPDATED,
            fieldName: "Task",
        } as TaskHistory);

        vi.spyOn(TaskChange, "create").mockRejectedValue(
            new Error("Database error")
        );

        const changes: ChangeDTO[] = [
            {
                fieldName: "title",
                oldValue: "Old title",
                newValue: "New title",
                actionType: ActionType.UPDATED,
            },
        ];

        try {
            await TaskHistoryRepository.createTaskHistory(
                "1",
                "1",
                ActionType.UPDATED,
                "Task",
                changes
            );

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Get task history by task Id", async () => {
        const mockTaskHistories = [
            {
                id: "1",
                taskId: "1",
                userId: "1",
                actionType: ActionType.CREATED,
                fieldName: "Task",
            },
            {
                id: "2",
                taskId: "1",
                userId: "1",
                actionType: ActionType.UPDATED,
                fieldName: "Task",
            },
        ] as TaskHistory[];

        vi.spyOn(TaskHistory, "findAll").mockResolvedValue(
            mockTaskHistories
        );

        const result =
            await TaskHistoryRepository.getTaskHistoryByTaskId("1");

        expect(result).toEqual(mockTaskHistories);
    });

    it("Get task history without task Id", async () => {
        try {
            await TaskHistoryRepository.getTaskHistoryByTaskId("");

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Get task history when database retrieval fails", async () => {
        vi.spyOn(TaskHistory, "findAll").mockRejectedValue(
            new Error("Database error")
        );

        try {
            await TaskHistoryRepository.getTaskHistoryByTaskId("1");

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });
});