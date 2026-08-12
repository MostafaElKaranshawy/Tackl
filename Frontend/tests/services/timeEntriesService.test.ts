import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
    getTaskTimeEntries,
    updateTimeEntry,
    deleteTimeEntry,
    createTimeEntry,
    getTimeEntryById,
} from "../../src/services/timeEntriesService";

describe("timeEntryService", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("getTaskTimeEntries", () => {
        it("should successfully get task time entries", async () => {
            const responseData = [
                {
                    id: "entry-1",
                    taskId: "task-1",
                    duration: 60,
                    date: "2026-08-12",
                    note: "Worked on authentication",
                },
                {
                    id: "entry-2",
                    taskId: "task-1",
                    duration: 120,
                    date: "2026-08-11",
                    note: "Worked on frontend",
                },
            ];

            const axiosGet = vi
                .spyOn(axios, "get")
                .mockResolvedValue({
                    data: responseData,
                });

            const projectId = "project-1";
            const taskId = "task-1";

            const result = await getTaskTimeEntries(
                projectId,
                taskId
            );

            expect(result).toEqual(responseData);

            expect(axiosGet).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/project-1/tasks/task-1/time-entries`
                ),
                {
                    withCredentials: true,
                }
            );
        });

        it("should return an empty array when there are no time entries", async () => {
            const responseData: never[] = [];

            vi.spyOn(axios, "get").mockResolvedValue({
                data: responseData,
            });

            const result = await getTaskTimeEntries(
                "project-1",
                "task-1"
            );

            expect(result).toEqual([]);
        });

        it("should propagate an axios error", async () => {
            const error = new Error(
                "Failed to get time entries"
            );

            vi.spyOn(axios, "get").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await getTaskTimeEntries(
                    "project-1",
                    "task-1"
                );
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });

    describe("updateTimeEntry", () => {
        it("should successfully update a time entry", async () => {
            const projectId = "project-1";
            const taskId = "task-1";
            const timeEntryId = "entry-1";

            const updatedData = {
                duration: 90,
                note: "Updated work",
            };

            const responseData = {
                id: timeEntryId,
                taskId,
                duration: 90,
                date: "2026-08-12",
                note: "Updated work",
            };

            const axiosPut = vi
                .spyOn(axios, "put")
                .mockResolvedValue({
                    data: responseData,
                });

            const result = await updateTimeEntry(
                projectId,
                taskId,
                timeEntryId,
                updatedData
            );

            expect(result).toEqual(responseData);

            expect(axiosPut).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/project-1/tasks/task-1/time-entries/entry-1`
                ),
                updatedData,
                {
                    withCredentials: true,
                }
            );
        });

        it("should successfully update only the duration", async () => {
            const projectId = "project-1";
            const taskId = "task-1";
            const timeEntryId = "entry-1";

            const updatedData = {
                duration: 120,
            };

            const responseData = {
                id: timeEntryId,
                taskId,
                duration: 120,
                date: "2026-08-12",
                note: "Existing note",
            };

            const axiosPut = vi
                .spyOn(axios, "put")
                .mockResolvedValue({
                    data: responseData,
                });

            const result = await updateTimeEntry(
                projectId,
                taskId,
                timeEntryId,
                updatedData
            );

            expect(result).toEqual(responseData);

            expect(axiosPut).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/project-1/tasks/task-1/time-entries/entry-1`
                ),
                updatedData,
                {
                    withCredentials: true,
                }
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error(
                "Failed to update time entry"
            );

            vi.spyOn(axios, "put").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await updateTimeEntry(
                    "project-1",
                    "task-1",
                    "entry-1",
                    {
                        duration: 90,
                    }
                );
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });

    describe("deleteTimeEntry", () => {
        it("should successfully delete a time entry", async () => {
            const axiosDelete = vi
                .spyOn(axios, "delete")
                .mockResolvedValue({
                    data: {
                        message:
                            "Time entry deleted successfully",
                    },
                });

            const projectId = "project-1";
            const taskId = "task-1";
            const timeEntryId = "entry-1";

            const result = await deleteTimeEntry(
                projectId,
                taskId,
                timeEntryId
            );

            expect(result).toBeUndefined();

            expect(axiosDelete).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/project-1/tasks/task-1/time-entries/entry-1`
                ),
                {
                    withCredentials: true,
                }
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error(
                "Failed to delete time entry"
            );

            vi.spyOn(axios, "delete").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await deleteTimeEntry(
                    "project-1",
                    "task-1",
                    "entry-1"
                );
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });

    describe("createTimeEntry", () => {
        it("should successfully create a time entry", async () => {
            const projectId = "project-1";
            const taskId = "task-1";

            const newTimeEntry = {
                duration: 60,
                date: "2026-08-12",
                note: "Worked on task",
            };

            const responseData = {
                id: "entry-1",
                taskId,
                duration: 60,
                date: "2026-08-12",
                note: "Worked on task",
            };

            const axiosPost = vi
                .spyOn(axios, "post")
                .mockResolvedValue({
                    data: responseData,
                });

            const result = await createTimeEntry(
                projectId,
                taskId,
                newTimeEntry
            );

            expect(result).toEqual(responseData);

            expect(axiosPost).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/project-1/tasks/task-1/time-entries`
                ),
                newTimeEntry,
                {
                    withCredentials: true,
                }
            );
        });

        it("should successfully create a time entry with partial data", async () => {
            const projectId = "project-1";
            const taskId = "task-1";

            const newTimeEntry = {
                duration: 30,
            };

            const responseData = {
                id: "entry-1",
                taskId,
                duration: 30,
                date: "2026-08-12",
            };

            const axiosPost = vi
                .spyOn(axios, "post")
                .mockResolvedValue({
                    data: responseData,
                });

            const result = await createTimeEntry(
                projectId,
                taskId,
                newTimeEntry
            );

            expect(result).toEqual(responseData);

            expect(axiosPost).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/project-1/tasks/task-1/time-entries`
                ),
                newTimeEntry,
                {
                    withCredentials: true,
                }
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error(
                "Failed to create time entry"
            );

            vi.spyOn(axios, "post").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await createTimeEntry(
                    "project-1",
                    "task-1",
                    {
                        duration: 60,
                        date: "2026-08-12",
                        note: "Worked on task",
                    }
                );
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });

    describe("getTimeEntryById", () => {
        it("should successfully get a time entry by id", async () => {
            const responseData = {
                id: "entry-1",
                taskId: "task-1",
                duration: 60,
                date: "2026-08-12",
                note: "Worked on task",
            };

            const axiosGet = vi
                .spyOn(axios, "get")
                .mockResolvedValue({
                    data: responseData,
                });

            const projectId = "project-1";
            const taskId = "task-1";
            const timeEntryId = "entry-1";

            const result = await getTimeEntryById(
                projectId,
                taskId,
                timeEntryId
            );

            expect(result).toEqual(responseData);

            expect(axiosGet).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/project-1/tasks/task-1/time-entries/entry-1`
                ),
                {
                    withCredentials: true,
                }
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error(
                "Time entry not found"
            );

            vi.spyOn(axios, "get").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await getTimeEntryById(
                    "project-1",
                    "task-1",
                    "entry-1"
                );
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });
});