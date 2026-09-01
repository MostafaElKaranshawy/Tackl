import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getTaskHistory } from "../../src/services/taskHistoryService";

describe("taskHistoryService", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("getTaskHistory", () => {
        it("should successfully get task history", async () => {
            const responseData = [
                {
                    id: "1",
                    taskId: "task-1",
                    fieldName: "status",
                    oldValue: "to do",
                    newValue: "in_progress",
                },
                {
                    id: "2",
                    taskId: "task-1",
                    fieldName: "priority",
                    oldValue: "low",
                    newValue: "high",
                },
            ];

            const axiosGet = vi
                .spyOn(axios, "get")
                .mockResolvedValue({
                    data: responseData,
                });

            const projectId = "project-1";
            const taskId = "task-1";

            const result = await getTaskHistory(
                projectId,
                taskId
            );

            expect(result).toEqual(responseData);

            expect(axiosGet).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/projects/${projectId}/tasks/${taskId}/history`
                ),
                {
                    withCredentials: true,
                }
            );
        });

        it("should return an empty array when there is no task history", async () => {
            const responseData: never[] = [];

            vi.spyOn(axios, "get").mockResolvedValue({
                data: responseData,
            });

            const result = await getTaskHistory(
                "project-1",
                "task-1"
            );

            expect(result).toEqual([]);
        });

        it("should propagate an axios error", async () => {
            const error = new Error(
                "Failed to get task history"
            );

            vi.spyOn(axios, "get").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await getTaskHistory(
                    "project-1",
                    "task-1"
                );
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });
});