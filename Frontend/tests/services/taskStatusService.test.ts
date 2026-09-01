import { afterEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import {
    getProjectTaskStatusByProjectId,
    getProjectTaskStatusByPK,
    createProjectTaskStatus,
    updateProjectTaskStatus,
    deleteProjectTaskStatus,
} from "../../src/services/taskStatusService";

vi.mock("axios", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

describe("taskStatusService", () => {
    const projectId = "project-1";
    const status = "testing";

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("getProjectTaskStatusByProjectId", () => {
        it("should get all task statuses for a project", async () => {
            const data = [
                {
                    status: "todo",
                    order: 0,
                    tasks: [],
                },
                {
                    status: "testing",
                    order: 1,
                    tasks: [],
                },
            ];

            vi.mocked(axios.get).mockResolvedValue({
                data,
            });

            const result =
                await getProjectTaskStatusByProjectId(
                    projectId
                );

            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/api/projects/${projectId}/task-statuses`
                ),
                {
                    withCredentials: true,
                }
            );

            expect(result).toEqual(data);
        });

        it("should propagate the error when getting task statuses fails", async () => {
            const error = new Error("Request failed");

            vi.mocked(axios.get).mockRejectedValue(error);

            await expect(
                getProjectTaskStatusByProjectId(projectId)
            ).rejects.toBe(error);

            expect(axios.get).toHaveBeenCalledTimes(1);
        });
    });

    describe("getProjectTaskStatusByPK", () => {
        it("should get a task status by status", async () => {
            const data = {
                status: "testing",
                order: 3,
                tasks: [],
            };

            vi.mocked(axios.get).mockResolvedValue({
                data,
            });

            const result =
                await getProjectTaskStatusByPK(
                    projectId,
                    status
                );

            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/api/projects/${projectId}/task-statuses/${status}`
                ),
                {
                    withCredentials: true,
                }
            );

            expect(result).toEqual(data);
        });

        it("should propagate the error when getting a task status fails", async () => {
            const error = new Error("Request failed");

            vi.mocked(axios.get).mockRejectedValue(error);

            await expect(
                getProjectTaskStatusByPK(
                    projectId,
                    status
                )
            ).rejects.toBe(error);

            expect(axios.get).toHaveBeenCalledTimes(1);
        });
    });

    describe("createProjectTaskStatus", () => {
        it("should create a task status", async () => {
            const boardColumnData = {
                status: "Testing",
                order: 3,
            };

            const data = {
                status: "testing",
                order: 3,
            };

            vi.mocked(axios.post).mockResolvedValue({
                data,
            });

            const result =
                await createProjectTaskStatus(
                    projectId,
                    boardColumnData
                );

            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/api/projects/${projectId}/task-statuses`
                ),
                boardColumnData,
                {
                    withCredentials: true,
                }
            );

            expect(result).toEqual(data);
        });

        it("should propagate the error when creating a task status fails", async () => {
            const error = new Error("Request failed");

            vi.mocked(axios.post).mockRejectedValue(error);

            await expect(
                createProjectTaskStatus(
                    projectId,
                    {
                        status: "Testing",
                        order: 3,
                    }
                )
            ).rejects.toBe(error);

            expect(axios.post).toHaveBeenCalledTimes(1);
        });
    });

    describe("updateProjectTaskStatus", () => {
        it("should update a task status", async () => {
            const updatedData = {
                status: "Review",
            };

            const data = {
                status: "review",
                order: 3,
            };

            vi.mocked(axios.put).mockResolvedValue({
                data,
            });

            const result =
                await updateProjectTaskStatus(
                    projectId,
                    status,
                    updatedData
                );

            expect(axios.put).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/api/projects/${projectId}/task-statuses/${status}`
                ),
                updatedData,
                {
                    withCredentials: true,
                }
            );

            expect(result).toEqual(data);
        });

        it("should update only the order", async () => {
            const updatedData = {
                order: 5,
            };

            const data = {
                status: "testing",
                order: 5,
            };

            vi.mocked(axios.put).mockResolvedValue({
                data,
            });

            const result =
                await updateProjectTaskStatus(
                    projectId,
                    status,
                    updatedData
                );

            expect(axios.put).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/api/projects/${projectId}/task-statuses/${status}`
                ),
                updatedData,
                {
                    withCredentials: true,
                }
            );

            expect(result).toEqual(data);
        });

        it("should propagate the error when updating a task status fails", async () => {
            const error = new Error("Request failed");

            vi.mocked(axios.put).mockRejectedValue(error);

            await expect(
                updateProjectTaskStatus(
                    projectId,
                    status,
                    {
                        status: "review",
                    }
                )
            ).rejects.toBe(error);

            expect(axios.put).toHaveBeenCalledTimes(1);
        });
    });

    describe("deleteProjectTaskStatus", () => {
        it("should delete a task status", async () => {
            vi.mocked(axios.delete).mockResolvedValue({
                status: 204,
            });

            const result =
                await deleteProjectTaskStatus(
                    projectId,
                    status
                );

            expect(axios.delete).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/api/projects/${projectId}/task-statuses/${status}`
                ),
                {
                    withCredentials: true,
                }
            );

            expect(result).toBeUndefined();
        });

        it("should propagate the error when deleting a task status fails", async () => {
            const error = new Error("Request failed");

            vi.mocked(axios.delete).mockRejectedValue(error);

            await expect(
                deleteProjectTaskStatus(
                    projectId,
                    status
                )
            ).rejects.toBe(error);

            expect(axios.delete).toHaveBeenCalledTimes(1);
        });
    });
});