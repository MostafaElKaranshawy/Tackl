import { afterEach, assert, describe, expect, it, vi } from "vitest";
import DBException from "../../src/exceptions/dbException";
import ForbiddenException from "../../src/exceptions/forbiddenException";
import MissingRequiredDataException from "../../src/exceptions/missingRequiredDataException";
import NotFoundException from "../../src/exceptions/notFoundException";
import TimeEntry from "../../src/models/timeEntry";
import TimeEntryRepository from "../../src/repositories/timeEntryRespository";

describe("TimeEntryRepository", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Create a new valid time entry", async () => {
        const mockTimeEntry = {
            id: "1",
            taskId: "1",
            duration: 120,
            date: new Date("2026-08-11"),
            note: "Worked on task",
        } as TimeEntry;

        vi.spyOn(TimeEntry, "create").mockResolvedValue(mockTimeEntry);

        const result = await TimeEntryRepository.createTimeEntry("1", {
            duration: 120,
            date: new Date("2026-08-11"),
            note: "Worked on task",
        });

        expect(result).toEqual(mockTimeEntry);
    });

    it("Create a time entry without duration", async () => {
        try {
            await TimeEntryRepository.createTimeEntry("1", {
                date: new Date("2026-08-11"),
                note: "Worked on task",
            });

            assert.fail(
                "Expected MissingRequiredDataException to be thrown"
            );
        } catch (error) {
            expect(error).toBeInstanceOf(MissingRequiredDataException);
        }
    });

    it("Create a time entry without date", async () => {
        try {
            await TimeEntryRepository.createTimeEntry("1", {
                duration: 120,
                note: "Worked on task",
            });

            assert.fail(
                "Expected MissingRequiredDataException to be thrown"
            );
        } catch (error) {
            expect(error).toBeInstanceOf(MissingRequiredDataException);
        }
    });

    it("Create a time entry when database creation fails", async () => {
        vi.spyOn(TimeEntry, "create").mockRejectedValue(
            new Error("Database error")
        );

        try {
            await TimeEntryRepository.createTimeEntry("1", {
                duration: 120,
                date: new Date("2026-08-11"),
                note: "Worked on task",
            });

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Get a valid time entry by Id", async () => {
        const mockTimeEntry = {
            id: "1",
            taskId: "1",
            duration: 120,
            date: new Date("2026-08-11"),
            note: "Worked on task",
            dataValues: {
                id: "1",
                taskId: "1",
                duration: 120,
                date: new Date("2026-08-11"),
                note: "Worked on task",
            },
        } as unknown as TimeEntry;

        vi.spyOn(TimeEntry, "findByPk").mockResolvedValue(mockTimeEntry);

        const result = await TimeEntryRepository.getTimeEntryById("1", "1");

        expect(result).toEqual(mockTimeEntry.dataValues);
    });

    it("Get a time entry with invalid Id", async () => {
        vi.spyOn(TimeEntry, "findByPk").mockResolvedValue(null);

        try {
            await TimeEntryRepository.getTimeEntryById("1", "1");

            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    it("Get a time entry belonging to a different task", async () => {
        const mockTimeEntry = {
            id: "1",
            taskId: "2",
            duration: 120,
            date: new Date("2026-08-11"),
            note: "Worked on task",
            dataValues: {
                id: "1",
                taskId: "2",
                duration: 120,
                date: new Date("2026-08-11"),
                note: "Worked on task",
            },
        } as unknown as TimeEntry;

        vi.spyOn(TimeEntry, "findByPk").mockResolvedValue(mockTimeEntry);

        try {
            await TimeEntryRepository.getTimeEntryById("1", "1");

            assert.fail("Expected ForbiddenException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenException);
        }
    });

    it("Get a time entry when database retrieval fails", async () => {
        vi.spyOn(TimeEntry, "findByPk").mockRejectedValue(
            new Error("Database error")
        );

        try {
            await TimeEntryRepository.getTimeEntryById("1", "1");

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Update a valid time entry", async () => {
        const mockTimeEntry = {
            id: "1",
            taskId: "1",
            duration: 120,
            date: new Date("2026-08-11"),
            note: "Old note",
            update: vi.fn().mockResolvedValue(undefined),
        } as unknown as TimeEntry;

        vi.spyOn(TimeEntry, "findByPk").mockResolvedValue(mockTimeEntry);

        const updatedData = {
            duration: 180,
            date: new Date("2026-08-12"),
            note: "Updated note",
        };

        const result = await TimeEntryRepository.updateTimeEntry(
            "1",
            "1",
            updatedData
        );

        expect(mockTimeEntry.update).toHaveBeenCalledWith({
            duration: 180,
            date: new Date("2026-08-12"),
            note: "Updated note",
        });

        expect(result).toBe(mockTimeEntry);
    });

    it("Update a time entry while keeping existing values", async () => {
        const existingDate = new Date("2026-08-11");

        const mockTimeEntry = {
            id: "1",
            taskId: "1",
            duration: 120,
            date: existingDate,
            note: "Old note",
            update: vi.fn().mockResolvedValue(undefined),
        } as unknown as TimeEntry;

        vi.spyOn(TimeEntry, "findByPk").mockResolvedValue(mockTimeEntry);

        const result = await TimeEntryRepository.updateTimeEntry(
            "1",
            "1",
            {}
        );

        expect(mockTimeEntry.update).toHaveBeenCalledWith({
            duration: 120,
            date: existingDate,
            note: "Old note",
        });

        expect(result).toBe(mockTimeEntry);
    });

    it("Update a time entry with invalid Id", async () => {
        vi.spyOn(TimeEntry, "findByPk").mockResolvedValue(null);

        try {
            await TimeEntryRepository.updateTimeEntry("1", "1", {
                duration: 180,
            });

            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    it("Update a time entry belonging to a different task", async () => {
        const mockTimeEntry = {
            id: "1",
            taskId: "2",
            duration: 120,
            date: new Date("2026-08-11"),
            note: "Old note",
        } as TimeEntry;

        vi.spyOn(TimeEntry, "findByPk").mockResolvedValue(mockTimeEntry);

        try {
            await TimeEntryRepository.updateTimeEntry("1", "1", {
                duration: 180,
            });

            assert.fail("Expected ForbiddenException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenException);
        }
    });

    it("Update a time entry when database update fails", async () => {
        const mockTimeEntry = {
            id: "1",
            taskId: "1",
            duration: 120,
            date: new Date("2026-08-11"),
            note: "Old note",
            update: vi.fn().mockRejectedValue(new Error("Database error")),
        } as unknown as TimeEntry;

        vi.spyOn(TimeEntry, "findByPk").mockResolvedValue(mockTimeEntry);

        try {
            await TimeEntryRepository.updateTimeEntry("1", "1", {
                duration: 180,
            });

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Delete a valid time entry", async () => {
        const mockTimeEntry = {
            id: "1",
            taskId: "1",
            duration: 120,
            date: new Date("2026-08-11"),
            note: "Worked on task",
            destroy: vi.fn().mockResolvedValue(undefined),
        } as unknown as TimeEntry;

        vi.spyOn(TimeEntry, "findByPk").mockResolvedValue(mockTimeEntry);

        try {
            await TimeEntryRepository.deleteTimeEntry("1", "1");
        } catch {
            assert.fail("Expected no exception to be thrown");
        }

        expect(mockTimeEntry.destroy).toHaveBeenCalled();
    });

    it("Delete a time entry with invalid Id", async () => {
        vi.spyOn(TimeEntry, "findByPk").mockResolvedValue(null);

        try {
            await TimeEntryRepository.deleteTimeEntry("1", "1");

            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    it("Delete a time entry belonging to a different task", async () => {
        const mockTimeEntry = {
            id: "1",
            taskId: "2",
            duration: 120,
            date: new Date("2026-08-11"),
            note: "Worked on task",
        } as TimeEntry;

        vi.spyOn(TimeEntry, "findByPk").mockResolvedValue(mockTimeEntry);

        try {
            await TimeEntryRepository.deleteTimeEntry("1", "1");

            assert.fail("Expected ForbiddenException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenException);
        }
    });

    it("Delete a time entry when database deletion fails", async () => {
        const mockTimeEntry = {
            id: "1",
            taskId: "1",
            duration: 120,
            date: new Date("2026-08-11"),
            note: "Worked on task",
            destroy: vi.fn().mockRejectedValue(new Error("Database error")),
        } as unknown as TimeEntry;

        vi.spyOn(TimeEntry, "findByPk").mockResolvedValue(mockTimeEntry);

        try {
            await TimeEntryRepository.deleteTimeEntry("1", "1");

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Get all time entries for a task", async () => {
        const mockTimeEntries = [
            {
                id: "1",
                taskId: "1",
                duration: 120,
                date: new Date("2026-08-10"),
                note: "First entry",
            },
            {
                id: "2",
                taskId: "1",
                duration: 60,
                date: new Date("2026-08-11"),
                note: "Second entry",
            },
        ] as TimeEntry[];

        vi.spyOn(TimeEntry, "findAll").mockResolvedValue(mockTimeEntries);

        const result = await TimeEntryRepository.getTaskTimeEntries("1");

        expect(result).toEqual(mockTimeEntries);
    });

    it("Get task time entries when database retrieval fails", async () => {
        vi.spyOn(TimeEntry, "findAll").mockRejectedValue(
            new Error("Database error")
        );

        try {
            await TimeEntryRepository.getTaskTimeEntries("1");

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Get task Id from a valid time entry", async () => {
        const mockTimeEntry = {
            taskId: "1",
        } as TimeEntry;

        vi.spyOn(TimeEntry, "findByPk").mockResolvedValue(mockTimeEntry);

        const result = await TimeEntryRepository.getTimeEntryTaskId("1");

        expect(result).toBe("1");
    });

    it("Get task Id from an invalid time entry", async () => {
        vi.spyOn(TimeEntry, "findByPk").mockResolvedValue(null);

        const result = await TimeEntryRepository.getTimeEntryTaskId("1");

        expect(result).toBeNull();
    });

    it("Get task Id when database retrieval fails", async () => {
        vi.spyOn(TimeEntry, "findByPk").mockRejectedValue(
            new Error("Database error")
        );

        try {
            await TimeEntryRepository.getTimeEntryTaskId("1");

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });
});