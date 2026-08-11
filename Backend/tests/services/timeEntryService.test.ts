import { afterEach, assert, describe, expect, it, vi } from "vitest";
import TimeEntryService from "../../src/services/timeEntryService";
import TimeEntry from "../../src/models/timeEntry";
import TimeEntryRepository from "../../src/repositories/timeEntryRespository";
import TaskRepository from "../../src/repositories/taskRepository";
import TaskHistoryRepository from "../../src/repositories/taskHistoryRepository";
import ForbiddenException from "../../src/exceptions/forbiddenException";
import NotFoundException from "../../src/exceptions/notFoundException";
import { ActionType } from "../../src/enums/actionType";

describe("TimeEntryService", () => {

    afterEach(() => {
        vi.restoreAllMocks();
    });


    it("Create a new valid time entry", async () => {

        vi.spyOn(TaskRepository, "getTaskById").mockResolvedValue({
            id: "task-1",
            projectId: "project-1",
            project: {
                userId: "user-1"
            }
        } as any);

        vi.spyOn(TimeEntryRepository, "createTimeEntry").mockResolvedValue({
            id: "entry-1",
            taskId: "task-1",
            duration: 120,
            date: new Date("2026-08-10"),
            note: "Worked on task"
        } as TimeEntry);

        vi.spyOn(TaskHistoryRepository, "createTaskHistory")
            .mockResolvedValue();

        const timeEntryData = {
            duration: 120,
            date: new Date("2026-08-10"),
            note: "Worked on task"
        };

        const result = await TimeEntryService.createTimeEntry(
            "user-1",
            "project-1",
            "task-1",
            timeEntryData
        );

        expect(result).toEqual({
            id: "entry-1",
            taskId: "task-1",
            duration: 120,
            date: new Date("2026-08-10"),
            note: "Worked on task"
        });

    });

    it("Create a time entry with invalid task", async () => {

        vi.spyOn(TaskRepository, "getTaskById")
            .mockResolvedValue(null);

        try {

            await TimeEntryService.createTimeEntry(
                "user-1",
                "project-1",
                "task-1",
                {
                    duration: 120,
                    date: new Date("2026-08-10"),
                    note: "Worked on task"
                }
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


    it("Create a time entry with a different project", async () => {

        vi.spyOn(TaskRepository, "getTaskById")
            .mockResolvedValue({
                id: "task-1",
                projectId: "project-2",
                project: {
                    userId: "user-1"
                }
            } as any);

        try {

            await TimeEntryService.createTimeEntry(
                "user-1",
                "project-1",
                "task-1",
                {
                    duration: 120,
                    date: new Date("2026-08-10")
                }
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


    it("Create a time entry with a different user", async () => {

        vi.spyOn(TaskRepository, "getTaskById")
            .mockResolvedValue({
                id: "task-1",
                projectId: "project-1",
                project: {
                    userId: "user-2"
                }
            } as any);

        try {

            await TimeEntryService.createTimeEntry(
                "user-1",
                "project-1",
                "task-1",
                {
                    duration: 120,
                    date: new Date("2026-08-10")
                }
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


    it("Get a valid time entry by Id", async () => {

        vi.spyOn(TaskRepository, "getTaskById")
            .mockResolvedValue({
                id: "task-1",
                projectId: "project-1",
                project: {
                    userId: "user-1"
                }
            } as any);

        vi.spyOn(TimeEntryRepository, "getTimeEntryById")
            .mockResolvedValue({
                id: "entry-1",
                taskId: "task-1",
                duration: 120,
                date: new Date("2026-08-10"),
                note: "Worked on task"
            } as TimeEntry);

        const result = await TimeEntryService.getTimeEntryById(
            "entry-1",
            "user-1",
            "project-1",
            "task-1"
        );

        expect(result).toEqual({
            id: "entry-1",
            taskId: "task-1",
            duration: 120,
            date: new Date("2026-08-10"),
            note: "Worked on task"
        });

    });


    it("Get a time entry with invalid task", async () => {

        vi.spyOn(TaskRepository, "getTaskById")
            .mockResolvedValue(null);

        try {

            await TimeEntryService.getTimeEntryById(
                "entry-1",
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


    it("Update a time entry", async () => {

        const oldDate = new Date("2026-08-10");
        const newDate = new Date("2026-08-11");

        vi.spyOn(TaskRepository, "getTaskById")
            .mockResolvedValue({
                id: "task-1",
                projectId: "project-1",
                project: {
                    userId: "user-1"
                }
            } as any);

        vi.spyOn(TimeEntryRepository, "getTimeEntryById")
            .mockResolvedValue({
                id: "entry-1",
                taskId: "task-1",
                duration: 60,
                date: oldDate,
                note: "Old note"
            } as TimeEntry);

        vi.spyOn(TimeEntryRepository, "updateTimeEntry")
            .mockResolvedValue({
                id: "entry-1",
                taskId: "task-1",
                duration: 120,
                date: newDate,
                note: "New note"
            } as TimeEntry);

        vi.spyOn(TaskHistoryRepository, "createTaskHistory")
            .mockResolvedValue();

        const result = await TimeEntryService.updateTimeEntry(
            "user-1",
            "project-1",
            "task-1",
            "entry-1",
            {
                duration: 120,
                date: newDate,
                note: "New note"
            }
        );

        expect(result).toEqual({
            id: "entry-1",
            taskId: "task-1",
            duration: 120,
            date: newDate,
            note: "New note"
        });

    });


    it("Update a time entry with invalid Id", async () => {

        vi.spyOn(TaskRepository, "getTaskById")
            .mockResolvedValue({
                id: "task-1",
                projectId: "project-1",
                project: {
                    userId: "user-1"
                }
            } as any);

        vi.spyOn(TimeEntryRepository, "getTimeEntryById")
            .mockResolvedValue(null);

        try {

            await TimeEntryService.updateTimeEntry(
                "user-1",
                "project-1",
                "task-1",
                "entry-1",
                {
                    duration: 120
                }
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


    it("Update a time entry and create history", async () => {

        const oldDate = new Date("2026-08-10");
        const newDate = new Date("2026-08-11");

        vi.spyOn(TaskRepository, "getTaskById")
            .mockResolvedValue({
                id: "task-1",
                projectId: "project-1",
                project: {
                    userId: "user-1"
                }
            } as any);

        vi.spyOn(TimeEntryRepository, "getTimeEntryById")
            .mockResolvedValue({
                id: "entry-1",
                taskId: "task-1",
                duration: 60,
                date: oldDate,
                note: "Old note"
            } as TimeEntry);

        vi.spyOn(TimeEntryRepository, "updateTimeEntry")
            .mockResolvedValue({
                id: "entry-1",
                taskId: "task-1",
                duration: 120,
                date: newDate,
                note: "New note"
            } as TimeEntry);

        const historySpy = vi.spyOn(
            TaskHistoryRepository,
            "createTaskHistory"
        ).mockResolvedValue();

        await TimeEntryService.updateTimeEntry(
            "user-1",
            "project-1",
            "task-1",
            "entry-1",
            {
                duration: 120,
                date: newDate,
                note: "New note"
            }
        );

        expect(historySpy).toHaveBeenCalledWith(
            "task-1",
            "user-1",
            ActionType.UPDATED,
            "Time Entry",
            expect.arrayContaining([
                expect.objectContaining({
                    fieldName: "duration",
                    oldValue: "60",
                    newValue: "120",
                    actionType: ActionType.UPDATED
                }),
                expect.objectContaining({
                    fieldName: "note",
                    oldValue: "Old note",
                    newValue: "New note",
                    actionType: ActionType.UPDATED
                })
            ])
        );

    });


    it("Delete a time entry", async () => {

        vi.spyOn(TaskRepository, "getTaskById")
            .mockResolvedValue({
                id: "task-1",
                projectId: "project-1",
                project: {
                    userId: "user-1"
                }
            } as any);

        vi.spyOn(TimeEntryRepository, "getTimeEntryById")
            .mockResolvedValue({
                id: "entry-1",
                taskId: "task-1",
                duration: 120,
                date: new Date("2026-08-10"),
                note: "Worked on task"
            } as TimeEntry);

        vi.spyOn(TimeEntryRepository, "deleteTimeEntry")
            .mockResolvedValue();

        vi.spyOn(TaskHistoryRepository, "createTaskHistory")
            .mockResolvedValue();

        try {

            await TimeEntryService.deleteTimeEntry(
                "user-1",
                "project-1",
                "task-1",
                "entry-1"
            );

        } catch {

            assert.fail(
                "Expected no exception to be thrown"
            );

        }

    });


    it("Delete a time entry with invalid Id", async () => {

        vi.spyOn(TaskRepository, "getTaskById")
            .mockResolvedValue({
                id: "task-1",
                projectId: "project-1",
                project: {
                    userId: "user-1"
                }
            } as any);

        vi.spyOn(TimeEntryRepository, "getTimeEntryById")
            .mockResolvedValue(null);

        try {

            await TimeEntryService.deleteTimeEntry(
                "user-1",
                "project-1",
                "task-1",
                "entry-1"
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


    it("Get task time entries", async () => {

        const mockTimeEntries = [
            {
                id: "entry-1",
                taskId: "task-1",
                duration: 60,
                date: new Date("2026-08-10"),
                note: "First entry"
            } as TimeEntry,

            {
                id: "entry-2",
                taskId: "task-1",
                duration: 120,
                date: new Date("2026-08-11"),
                note: "Second entry"
            } as TimeEntry
        ];

        vi.spyOn(TaskRepository, "getTaskById")
            .mockResolvedValue({
                id: "task-1",
                projectId: "project-1",
                project: {
                    userId: "user-1"
                }
            } as any);

        vi.spyOn(TimeEntryRepository, "getTaskTimeEntries")
            .mockResolvedValue(mockTimeEntries);

        const result = await TimeEntryService.getTaskTimeEntries(
            "user-1",
            "project-1",
            "task-1"
        );

        expect(result).toEqual(mockTimeEntries);

    });


    it("Get task time entries with invalid task", async () => {

        vi.spyOn(TaskRepository, "getTaskById")
            .mockResolvedValue(null);

        try {

            await TimeEntryService.getTaskTimeEntries(
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


    it("Get task time entries with different project", async () => {

        vi.spyOn(TaskRepository, "getTaskById")
            .mockResolvedValue({
                id: "task-1",
                projectId: "project-2",
                project: {
                    userId: "user-1"
                }
            } as any);

        try {

            await TimeEntryService.getTaskTimeEntries(
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


    it("Get task time entries with different user", async () => {

        vi.spyOn(TaskRepository, "getTaskById")
            .mockResolvedValue({
                id: "task-1",
                projectId: "project-1",
                project: {
                    userId: "user-2"
                }
            } as any);

        try {

            await TimeEntryService.getTaskTimeEntries(
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

});