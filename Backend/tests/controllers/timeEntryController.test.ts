import { afterEach, describe, expect, it, vi } from "vitest";
import TimeEntryController from "../../src/controllers/timeEntryController";
import TimeEntryService from "../../src/services/timeEntryService";
import ForbiddenException from "../../src/exceptions/forbiddenException";
import MissingRequiredDataException from "../../src/exceptions/missingRequiredDataException";
import NotFoundException from "../../src/exceptions/notFoundException";
import TimeEntry from "../../src/models/timeEntry";

describe("TimeEntryController", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    const createMockResponse = () => {
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis(),
        };

        return res;
    };

    const next = vi.fn();

    it("Create a valid time entry", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
            },
            body: {
                duration: 150,
                date: new Date("2026-08-11"),
                note: "Worked on task",
            },
        } as any;

        const res = createMockResponse();

        const timeEntry = {
            id: "entry-1",
            taskId: "task-1",
            duration: 150,
            date: new Date("2026-08-11"),
            note: "Worked on task",
        } as TimeEntry;

        vi.spyOn(TimeEntryService, "createTimeEntry").mockResolvedValue(
            timeEntry
        );
        await TimeEntryController.createTimeEntry(req, res as any, next);

        expect(TimeEntryService.createTimeEntry).toHaveBeenCalledWith(
            "user-1",
            "project-1",
            "task-1",
            {
                duration: 150,
                date: new Date("2026-08-11"),
                note: "Worked on task",
            }
        );

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(timeEntry);
    });

    it("Create time entry without user ID", async () => {
        const req = {
            userId: undefined,
            params: {
                projectId: "project-1",
                taskId: "task-1",
            },
            body: {
                duration: 150,
                date: new Date("2026-08-11"),
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.createTimeEntry(req, res as any, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(ForbiddenException)
        );
    });

    it("Create time entry without project ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: undefined,
                taskId: "task-1",
            },
            body: {
                duration: 150,
                date: new Date("2026-08-11"),
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.createTimeEntry(req, res as any, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Create time entry without task ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: undefined,
            },
            body: {
                duration: 150,
                date: new Date("2026-08-11"),
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.createTimeEntry(req, res as any, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Create time entry without required data", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
            },
            body: {},
        } as any;

        const res = createMockResponse();

        await TimeEntryController.createTimeEntry(req, res as any, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Create time entry with invalid duration", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
            },
            body: {
                duration: -1,
                date: new Date("2026-08-11"),
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.createTimeEntry(req, res as any, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Create time entry with invalid date", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
            },
            body: {
                duration: 150,
                date: new Date(Date.now() + 1000 * 60 * 60 * 24), // Future date
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.createTimeEntry(req, res as any, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Get a valid time entry by ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
                timeEntryId: "entry-1",
            },
        } as any;

        const res = createMockResponse();

        const timeEntry = {
            id: "entry-1",
            taskId: "task-1",
            duration: 150,
            date: new Date("2026-08-11"),
            note: "Worked on task",
        } as TimeEntry;

        vi.spyOn(TimeEntryService, "getTimeEntryById").mockResolvedValue(
            timeEntry
        );

        await TimeEntryController.getTimeEntryById(req, res as any, next);

        expect(TimeEntryService.getTimeEntryById).toHaveBeenCalledWith(
            "entry-1",
            "user-1",
            "project-1",
            "task-1"
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(timeEntry);
    });

    it("Get time entry without user ID", async () => {
        const req = {
            userId: undefined,
            params: {
                projectId: "project-1",
                taskId: "task-1",
                timeEntryId: "entry-1",
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.getTimeEntryById(req, res as any, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(ForbiddenException)
        );
    });

    it("Get time entry without project ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: undefined,
                taskId: "task-1",
                timeEntryId: "entry-1",
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.getTimeEntryById(req, res as any, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Get time entry without task ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: undefined,
                timeEntryId: "entry-1",
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.getTimeEntryById(req, res as any, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Get time entry without time entry ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
                timeEntryId: undefined,
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.getTimeEntryById(req, res as any, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Get a non-existing time entry", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
                timeEntryId: "entry-1",
            },
        } as any;

        const res = createMockResponse();

        vi.spyOn(TimeEntryService, "getTimeEntryById").mockResolvedValue(
            null
        );

        await TimeEntryController.getTimeEntryById(req, res as any, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(NotFoundException)
        );
    });

    it("Update a valid time entry", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
                timeEntryId: "entry-1",
            },
            body: {
                duration: 180,
                date: new Date("2026-08-10"),
                note: "Updated note",
            },
        } as any;

        const res = createMockResponse();

        const updatedTimeEntry = {
            id: "entry-1",
            taskId: "task-1",
            duration: 180,
            date: new Date("2026-08-10"),
            note: "Updated note",
        } as TimeEntry;

        vi.spyOn(TimeEntryService, "updateTimeEntry").mockResolvedValue(
            updatedTimeEntry
        );

        await TimeEntryController.updateTimeEntry(
            req,
            res as any,
            next
        );

        expect(TimeEntryService.updateTimeEntry).toHaveBeenCalledWith(
            "user-1",
            "project-1",
            "task-1",
            "entry-1",
            {
                duration: 180,
                date: new Date("2026-08-10"),
                note: "Updated note",
            }
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(updatedTimeEntry);
    });

    it("Update time entry without user ID", async () => {
        const req = {
            userId: undefined,
            params: {
                projectId: "project-1",
                taskId: "task-1",
                timeEntryId: "entry-1",
            },
            body: {
                note: "Updated",
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.updateTimeEntry(req, res as any, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(ForbiddenException)
        );
    });

    it("Update time entry without project ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: undefined,
                taskId: "task-1",
                timeEntryId: "entry-1",
            },
            body: {
                note: "Updated",
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.updateTimeEntry(req, res as any, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Update time entry without task ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: undefined,
                timeEntryId: "entry-1",
            },
            body: {
                note: "Updated",
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.updateTimeEntry(req, res as any, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Update time entry without time entry ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
                timeEntryId: undefined,
            },
            body: {
                note: "Updated",
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.updateTimeEntry(req, res as any, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Update time entry with invalid duration", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
                timeEntryId: "entry-1",
            },
            body: {
                duration: -1,
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.updateTimeEntry(req, res as any, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Update time entry with invalid date", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
                timeEntryId: "entry-1",
            },
            body: {
                date: new Date(Date.now() + 1000 * 60 * 60 * 24), // Future date
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.updateTimeEntry(req, res as any, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Update time entry without any fields", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
                timeEntryId: "entry-1",
            },
            body: {},
        } as any;

        const res = createMockResponse();

        await TimeEntryController.updateTimeEntry(req, res as any, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Delete a valid time entry", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
                timeEntryId: "entry-1",
            },
        } as any;

        const res = createMockResponse();

        vi.spyOn(TimeEntryService, "deleteTimeEntry").mockResolvedValue();

        await TimeEntryController.deleteTimeEntry(
            req,
            res as any,
            next
        );

        expect(TimeEntryService.deleteTimeEntry).toHaveBeenCalledWith(
            "user-1",
            "project-1",
            "task-1",
            "entry-1"
        );

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    it("Delete time entry without user ID", async () => {
        const req = {
            userId: undefined,
            params: {
                projectId: "project-1",
                taskId: "task-1",
                timeEntryId: "entry-1",
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.deleteTimeEntry(
            req,
            res as any,
            next
        );

        expect(next).toHaveBeenCalledWith(
            expect.any(ForbiddenException)
        );
    });

    it("Delete time entry without project ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: undefined,
                taskId: "task-1",
                timeEntryId: "entry-1",
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.deleteTimeEntry(
            req,
            res as any,
            next
        );

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Delete time entry without task ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: undefined,
                timeEntryId: "entry-1",
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.deleteTimeEntry(
            req,
            res as any,
            next
        );

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Delete time entry without time entry ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
                timeEntryId: undefined,
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.deleteTimeEntry(
            req,
            res as any,
            next
        );

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Get task time entries", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: "task-1",
            },
        } as any;

        const res = createMockResponse();

        const timeEntries = [
            {
                id: "entry-1",
                taskId: "task-1",
                duration: 120,
                date: new Date("2026-08-10"),
                note: "First entry",
            },
            {
                id: "entry-2",
                taskId: "task-1",
                duration: 90,
                date: new Date("2026-08-11"),
                note: "Second entry",
            },
        ] as TimeEntry[];

        vi.spyOn(
            TimeEntryService,
            "getTaskTimeEntries"
        ).mockResolvedValue(timeEntries);

        await TimeEntryController.getTaskTimeEntries(
            req,
            res as any,
            next
        );

        expect(TimeEntryService.getTaskTimeEntries).toHaveBeenCalledWith(
            "user-1",
            "project-1",
            "task-1"
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(timeEntries);
    });

    it("Get task time entries without user ID", async () => {
        const req = {
            userId: undefined,
            params: {
                projectId: "project-1",
                taskId: "task-1",
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.getTaskTimeEntries(
            req,
            res as any,
            next
        );

        expect(next).toHaveBeenCalledWith(
            expect.any(ForbiddenException)
        );
    });

    it("Get task time entries without project ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: undefined,
                taskId: "task-1",
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.getTaskTimeEntries(
            req,
            res as any,
            next
        );

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Get task time entries without task ID", async () => {
        const req = {
            userId: "user-1",
            params: {
                projectId: "project-1",
                taskId: undefined,
            },
        } as any;

        const res = createMockResponse();

        await TimeEntryController.getTaskTimeEntries(
            req,
            res as any,
            next
        );

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });
});