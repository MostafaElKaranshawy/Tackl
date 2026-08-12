import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
    getProjectTasks,
    getAllProjectTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
} from "../../src/services/taskService";
import { CreateTaskDto } from "../../src/types/task";

describe("taskService", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("getProjectTasks", () => {
        it("should successfully get project tasks", async () => {
            const responseData = {
                total: 2,
                tasks: [
                    {
                        id: "task-1",
                        title: "Task 1",
                        description: "First task",
                        status: "todo",
                        priority: "high",
                    },
                    {
                        id: "task-2",
                        title: "Task 2",
                        description: "Second task",
                        status: "done",
                        priority: "medium",
                    },
                ],
            };

            const axiosGet = vi
                .spyOn(axios, "get")
                .mockResolvedValue({
                    data: responseData,
                });

            const projectId = "project-1";

            const options = {
                page: 1,
                pageSize: 10,
                sortBy: "createdAt",
                sortOrder: "desc",
                search: "",
                status: "todo",
                priority: "high",
                overdue: false,
            };

            const result = await getProjectTasks(
                projectId,
                options
            );

            expect(result).toEqual(responseData);

            expect(axiosGet).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/projects/${projectId}/tasks`
                ),
                {
                    withCredentials: true,
                    params: {
                        page: options.page,
                        limit: options.pageSize,
                        sortBy: options.sortBy,
                        sortOrder: options.sortOrder,
                        search: options.search,
                        status: options.status,
                        priority: options.priority,
                        overdue: options.overdue,
                    },
                }
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error(
                "Failed to get project tasks"
            );

            vi.spyOn(axios, "get").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await getProjectTasks("project-1", {
                    page: 1,
                    pageSize: 10,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                    search: "",
                    status: "todo",
                    priority: "high",
                    overdue: false,
                });
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });

    describe("getAllProjectTasks", () => {
        it("should successfully get all project tasks", async () => {
            const responseData = [
                {
                    id: "task-1",
                    title: "Task 1",
                    description: "First task",
                    status: "todo",
                    priority: "high",
                },
                {
                    id: "task-2",
                    title: "Task 2",
                    description: "Second task",
                    status: "done",
                    priority: "medium",
                },
            ];

            const axiosGet = vi
                .spyOn(axios, "get")
                .mockResolvedValue({
                    data: responseData,
                });

            const projectId = "project-1";

            const options = {
                sortBy: "createdAt",
                sortOrder: "desc",
            };

            const result = await getAllProjectTasks(
                projectId,
                options
            );

            expect(result).toEqual(responseData);

            expect(axiosGet).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/projects/${projectId}/tasks/all`
                ),
                {
                    withCredentials: true,
                    params: {
                        sortBy: options.sortBy,
                        sortOrder: options.sortOrder,
                    },
                }
            );
        });

        it("should successfully get all project tasks without options", async () => {
            const responseData = [
                {
                    id: "task-1",
                    title: "Task 1",
                    description: "First task",
                    status: "todo",
                    priority: "high",
                },
            ];

            const axiosGet = vi
                .spyOn(axios, "get")
                .mockResolvedValue({
                    data: responseData,
                });

            const projectId = "project-1";

            const result = await getAllProjectTasks(
                projectId
            );

            expect(result).toEqual(responseData);

            expect(axiosGet).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/projects/${projectId}/tasks/all`
                ),
                {
                    withCredentials: true,
                    params: {
                        sortBy: undefined,
                        sortOrder: undefined,
                    },
                }
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error(
                "Failed to get all project tasks"
            );

            vi.spyOn(axios, "get").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await getAllProjectTasks("project-1", {
                    sortBy: "createdAt",
                    sortOrder: "desc",
                });
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });

    describe("getTaskById", () => {
        it("should successfully get a task by id", async () => {
            const responseData = {
                id: "task-1",
                title: "Test Task",
                description: "Test description",
                status: "todo",
                priority: "high",
            };

            const axiosGet = vi
                .spyOn(axios, "get")
                .mockResolvedValue({
                    data: responseData,
                });

            const taskId = "task-1";
            const projectId = "project-1";

            const result = await getTaskById(
                taskId,
                projectId
            );

            expect(result).toEqual(responseData);

            expect(axiosGet).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/projects/${projectId}/tasks/${taskId}`
                ),
                {
                    withCredentials: true,
                }
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error("Task not found");

            vi.spyOn(axios, "get").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await getTaskById(
                    "task-1",
                    "project-1"
                );
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });

    describe("createTask", () => {
        it("should successfully create a task", async () => {
            const taskData: CreateTaskDto = {
                title: "New Task",
                description: "New task description",
                status: "todo",
                priority: "medium",
            } as CreateTaskDto;

            const responseData = {
                id: "task-1",
                ...taskData,
            };

            const axiosPost = vi
                .spyOn(axios, "post")
                .mockResolvedValue({
                    data: responseData,
                });

            const projectId = "project-1";

            const result = await createTask(
                taskData,
                projectId
            );

            expect(result).toEqual(responseData);

            expect(axiosPost).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/projects/${projectId}/tasks`
                ),
                taskData,
                {
                    withCredentials: true,
                }
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error(
                "Failed to create task"
            );

            vi.spyOn(axios, "post").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await createTask(
                    {
                        title: "New Task",
                        description: "Description",
                        status: "todo",
                        priority: "medium",
                    } as CreateTaskDto,
                    "project-1"
                );
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });

    describe("updateTask", () => {
        it("should successfully update a task", async () => {
            const taskId = "task-1";
            const projectId = "project-1";

            const updatedData = {
                title: "Updated Task",
                description: "Updated description",
            };

            const responseData = {
                id: taskId,
                title: "Updated Task",
                description: "Updated description",
                status: "todo",
                priority: "medium",
            };

            const axiosPut = vi
                .spyOn(axios, "put")
                .mockResolvedValue({
                    data: responseData,
                });

            const result = await updateTask(
                taskId,
                updatedData,
                projectId
            );

            expect(result).toEqual(responseData);

            expect(axiosPut).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/projects/${projectId}/tasks/${taskId}`
                ),
                updatedData,
                {
                    withCredentials: true,
                }
            );
        });

        it("should successfully update only the task title", async () => {
            const taskId = "task-1";
            const projectId = "project-1";

            const updatedData = {
                title: "Updated Task",
            };

            const responseData = {
                id: taskId,
                title: "Updated Task",
                description: "Old description",
                status: "todo",
                priority: "medium",
            };

            const axiosPut = vi
                .spyOn(axios, "put")
                .mockResolvedValue({
                    data: responseData,
                });

            const result = await updateTask(
                taskId,
                updatedData,
                projectId
            );

            expect(result).toEqual(responseData);

            expect(axiosPut).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/projects/${projectId}/tasks/${taskId}`
                ),
                updatedData,
                {
                    withCredentials: true,
                }
            );
        });

        it("should successfully update only the task description", async () => {
            const taskId = "task-1";
            const projectId = "project-1";

            const updatedData = {
                description: "Updated description",
            };

            const responseData = {
                id: taskId,
                title: "Old title",
                description: "Updated description",
                status: "todo",
                priority: "medium",
            };

            const axiosPut = vi
                .spyOn(axios, "put")
                .mockResolvedValue({
                    data: responseData,
                });

            const result = await updateTask(
                taskId,
                updatedData,
                projectId
            );

            expect(result).toEqual(responseData);

            expect(axiosPut).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/projects/${projectId}/tasks/${taskId}`
                ),
                updatedData,
                {
                    withCredentials: true,
                }
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error(
                "Failed to update task"
            );

            vi.spyOn(axios, "put").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await updateTask(
                    "task-1",
                    {
                        title: "Updated Task",
                    },
                    "project-1"
                );
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });

    describe("deleteTask", () => {
        it("should successfully delete a task", async () => {
            const axiosDelete = vi
                .spyOn(axios, "delete")
                .mockResolvedValue({
                    data: {
                        message: "Task deleted successfully",
                    },
                });

            const taskId = "task-1";
            const projectId = "project-1";

            const result = await deleteTask(
                taskId,
                projectId
            );

            expect(result).toBeUndefined();

            expect(axiosDelete).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/projects/${projectId}/tasks/${taskId}`
                ),
                {
                    withCredentials: true,
                }
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error(
                "Failed to delete task"
            );

            vi.spyOn(axios, "delete").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await deleteTask(
                    "task-1",
                    "project-1"
                );
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });
});