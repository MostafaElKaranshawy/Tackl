import { afterEach, assert, describe, expect, it, vi } from "vitest";
import TaskRepository from "../../src/repositories/taskRepository";
import Task from "../../src/models/task";
import Project from "../../src/models/project";
import DBException from "../../src/exceptions/dbException";
import NotFoundException from "../../src/exceptions/notFoundException";
import ForbiddenException from "../../src/exceptions/forbiddenException";
import MissingRequiredDataException from "../../src/exceptions/missingRequiredDataException";

describe("TaskRepository", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Create a new valid task", async () => {
        vi.spyOn(Task, "create").mockResolvedValue({
            id: "1",
            title: "Test Task",
            description: "Test description",
            status: "to do",
            priority: "medium",
            estimatedTime: 60,
            dueDate: new Date("2026-08-20"),
            projectId: "1",
        } as Task);

        const taskData = {
            title: "Test Task",
            description: "Test description",
            status: "to do" as const,
            priority: "medium" as const,
            estimatedTime: 60,
            dueDate: new Date("2026-08-20"),
        };

        const result = await TaskRepository.createTask(taskData, "1");

        expect(result).toEqual({
            id: "1",
            title: "Test Task",
            description: "Test description",
            status: "to do",
            priority: "medium",
            estimatedTime: 60,
            dueDate: new Date("2026-08-20"),
            projectId: "1",
        });
    });

    it("Create a task without a title", async () => {
        try {
            await TaskRepository.createTask(
                {
                    description: "Test description",
                },
                "1"
            );

            assert.fail("Expected MissingRequiredDataException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(MissingRequiredDataException);
        }
    });

    it("Create a task with a database error", async () => {
        vi.spyOn(Task, "create").mockRejectedValue(
            new Error("Database error")
        );

        try {
            await TaskRepository.createTask(
                {
                    title: "Test Task",
                },
                "1"
            );

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Get a valid task by Id", async () => {
        vi.spyOn(Task, "findByPk").mockResolvedValue({
            id: "1",
            title: "Test Task",
            description: "Test description",
            status: "to do",
            priority: "medium",
            estimatedTime: 60,
            dueDate: new Date("2026-08-20"),
            projectId: "1",
            project: {
                userId: "1",
            },
        } as Task);

        const result = await TaskRepository.getTaskById("1", "1", "1");

        expect(result).toEqual({
            id: "1",
            title: "Test Task",
            description: "Test description",
            status: "to do",
            priority: "medium",
            estimatedTime: 60,
            dueDate: new Date("2026-08-20"),
            projectId: "1",
            project: {
                userId: "1",
            },
        });
    });

    it("Get a task with invalid task Id", async () => {
        vi.spyOn(Task, "findByPk").mockResolvedValue(null);

        try {
            await TaskRepository.getTaskById("1", "1", "invalid");

            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    it("Get a task that belongs to a different project", async () => {
        vi.spyOn(Task, "findByPk").mockResolvedValue({
            id: "1",
            title: "Test Task",
            projectId: "2",
            project: {
                userId: "1",
            },
        } as Task);

        try {
            await TaskRepository.getTaskById("1", "1", "1");

            assert.fail("Expected ForbiddenException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenException);
        }
    });

    it("Get a task belonging to a different user", async () => {
        vi.spyOn(Task, "findByPk").mockResolvedValue({
            id: "1",
            title: "Test Task",
            projectId: "1",
            project: {
                userId: "2",
            },
        } as Task);

        try {
            await TaskRepository.getTaskById("1", "1", "1");

            assert.fail("Expected ForbiddenException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenException);
        }
    });

    it("Get a task with database error", async () => {
        vi.spyOn(Task, "findByPk").mockRejectedValue(
            new Error("Database error")
        );

        try {
            await TaskRepository.getTaskById("1", "1", "1");

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Update a task", async () => {
        const task = {
            id: "1",
            title: "Test Task",
            description: "Test description",
            status: "to do",
            priority: "medium",
            projectId: "1",
            project: {
                userId: "1",
            },
            update: vi.fn().mockResolvedValue(undefined),
        } as unknown as Task;

        vi.spyOn(Task, "findByPk").mockResolvedValue(task);

        const updatedData = {
            title: "Updated Task",
            description: "Updated description",
        };

        const result = await TaskRepository.updateTask(
            "1",
            "1",
            "1",
            updatedData
        );

        expect(task.update).toHaveBeenCalledWith(updatedData);
        expect(result).toBe(task);
    });

    it("Update a task with invalid task Id", async () => {
        vi.spyOn(Task, "findByPk").mockResolvedValue(null);

        try {
            await TaskRepository.updateTask(
                "1",
                "1",
                "invalid",
                {
                    title: "Updated Task",
                }
            );

            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    it("Update a task belonging to a different project", async () => {
        vi.spyOn(Task, "findByPk").mockResolvedValue({
            id: "1",
            title: "Test Task",
            projectId: "2",
            project: {
                userId: "1",
            },
        } as Task);

        try {
            await TaskRepository.updateTask(
                "1",
                "1",
                "1",
                {
                    title: "Updated Task",
                }
            );

            assert.fail("Expected ForbiddenException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenException);
        }
    });

    it("Update a task belonging to a different user", async () => {
        vi.spyOn(Task, "findByPk").mockResolvedValue({
            id: "1",
            title: "Test Task",
            projectId: "1",
            project: {
                userId: "2",
            },
        } as Task);

        try {
            await TaskRepository.updateTask(
                "1",
                "1",
                "1",
                {
                    title: "Updated Task",
                }
            );

            assert.fail("Expected ForbiddenException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenException);
        }
    });

    it("Update a task with database error", async () => {
        const task = {
            id: "1",
            title: "Test Task",
            projectId: "1",
            project: {
                userId: "1",
            },
            update: vi.fn().mockRejectedValue(
                new Error("Database error")
            ),
        } as unknown as Task;

        vi.spyOn(Task, "findByPk").mockResolvedValue(task);

        try {
            await TaskRepository.updateTask(
                "1",
                "1",
                "1",
                {
                    title: "Updated Task",
                }
            );

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Delete a task", async () => {
        const task = {
            id: "1",
            title: "Test Task",
            projectId: "1",
            project: {
                userId: "1",
            },
            destroy: vi.fn().mockResolvedValue(undefined),
        } as unknown as Task;

        vi.spyOn(Task, "findByPk").mockResolvedValue(task);

        await TaskRepository.deleteTask("1", "1", "1");

        expect(task.destroy).toHaveBeenCalled();
    });

    it("Delete a task with invalid task Id", async () => {
        vi.spyOn(Task, "findByPk").mockResolvedValue(null);

        try {
            await TaskRepository.deleteTask("1", "1", "invalid");

            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    it("Delete a task belonging to a different project", async () => {
        vi.spyOn(Task, "findByPk").mockResolvedValue({
            id: "1",
            title: "Test Task",
            projectId: "2",
            project: {
                userId: "1",
            },
        } as Task);

        try {
            await TaskRepository.deleteTask("1", "1", "1");

            assert.fail("Expected ForbiddenException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenException);
        }
    });

    it("Delete a task belonging to a different user", async () => {
        vi.spyOn(Task, "findByPk").mockResolvedValue({
            id: "1",
            title: "Test Task",
            projectId: "1",
            project: {
                userId: "2",
            },
        } as Task);

        try {
            await TaskRepository.deleteTask("1", "1", "1");

            assert.fail("Expected ForbiddenException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenException);
        }
    });

    it("Delete a task with database error", async () => {
        const task = {
            id: "1",
            title: "Test Task",
            projectId: "1",
            project: {
                userId: "1",
            },
            destroy: vi.fn().mockRejectedValue(
                new Error("Database error")
            ),
        } as unknown as Task;

        vi.spyOn(Task, "findByPk").mockResolvedValue(task);

        try {
            await TaskRepository.deleteTask("1", "1", "1");

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Get project tasks", async () => {
        const tasks = [
            {
                id: "1",
                title: "Task 1",
                projectId: "1",
            },
            {
                id: "2",
                title: "Task 2",
                projectId: "1",
            },
        ] as Task[];

        vi.spyOn(Task, "findAll").mockResolvedValue(tasks);
        vi.spyOn(Task, "count").mockResolvedValue(2);

        const queryParams = {
            page: 1,
            limit: 10,
            sortBy: "createdAt",
            sortOrder: "asc",
        };

        const result = await TaskRepository.getProjectTasks(
            "1",
            queryParams
        );

        expect(result).toEqual({
            tasks,
            total: 2,
        });
    });

    it("Get project tasks with search and filters", async () => {
        const tasks = [
            {
                id: "1",
                title: "Test Task",
                projectId: "1",
                status: "done",
                priority: "high",
            },
        ] as Task[];

        vi.spyOn(Task, "findAll").mockResolvedValue(tasks);
        vi.spyOn(Task, "count").mockResolvedValue(1);

        const queryParams = {
            page: 1,
            limit: 10,
            sortBy: "title",
            sortOrder: "desc",
            search: "Test",
            filterStatus: "done",
            filterPriority: "high",
            filterOverDue: true,
        };

        const result = await TaskRepository.getProjectTasks(
            "1",
            queryParams
        );

        expect(result).toEqual({
            tasks,
            total: 1,
        });
    });

    it("Get project tasks without pagination", async () => {
        const tasks = [
            {
                id: "1",
                title: "Task 1",
                projectId: "1",
            },
        ] as Task[];

        vi.spyOn(Task, "findAll").mockResolvedValue(tasks);
        vi.spyOn(Task, "count").mockResolvedValue(1);

        const queryParams = {
            sortBy: "createdAt",
            sortOrder: "asc",
        };

        const result = await TaskRepository.getProjectTasks(
            "1",
            queryParams
        );

        expect(result).toEqual({
            tasks,
            total: 1,
        });
    });

    it("Get project tasks with database error", async () => {
        vi.spyOn(Task, "findAll").mockRejectedValue(
            new Error("Database error")
        );

        try {
            await TaskRepository.getProjectTasks("1", {
                page: 1,
                limit: 10,
                sortBy: "createdAt",
                sortOrder: "asc",
            });

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Get all project tasks", async () => {
        const tasks = [
            {
                id: "1",
                title: "Task 1",
                projectId: "1",
            },
            {
                id: "2",
                title: "Task 2",
                projectId: "1",
            },
        ] as Task[];

        vi.spyOn(Task, "findAll").mockResolvedValue(tasks);

        const result = await TaskRepository.getAllProjectTasks(
            "1",
            "createdAt",
            "asc"
        );

        expect(result).toEqual(tasks);
    });

    it("Get all project tasks with database error", async () => {
        vi.spyOn(Task, "findAll").mockRejectedValue(
            new Error("Database error")
        );

        try {
            await TaskRepository.getAllProjectTasks(
                "1",
                "createdAt",
                "asc"
            );

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Get task project Id", async () => {
        vi.spyOn(Task, "findByPk").mockResolvedValue({
            id: "1",
            projectId: "1",
        } as Task);

        const result = await TaskRepository.getTaskProjectId("1");

        expect(result).toBe("1");
    });

    it("Get task project Id with invalid task Id", async () => {
        vi.spyOn(Task, "findByPk").mockResolvedValue(null);

        try {
            await TaskRepository.getTaskProjectId("1");

            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    it("Get task project Id with database error", async () => {
        vi.spyOn(Task, "findByPk").mockRejectedValue(
            new Error("Database error")
        );

        try {
            await TaskRepository.getTaskProjectId("1");

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Get task user Id", async () => {
        vi.spyOn(Task, "findByPk").mockResolvedValue({
            id: "1",
            projectId: "1",
            project: {
                userId: "1",
            },
        } as Task);

        const result = await TaskRepository.getTaskUserId("1");

        expect(result).toBe("1");
    });

    it("Get task user Id with invalid task Id", async () => {
        vi.spyOn(Task, "findByPk").mockResolvedValue(null);

        try {
            await TaskRepository.getTaskUserId("1");

            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    it("Get task user Id when project/user is missing", async () => {
        vi.spyOn(Task, "findByPk").mockResolvedValue({
            id: "1",
            projectId: "1",
            project: undefined,
        } as Task);

        try {
            await TaskRepository.getTaskUserId("1");

            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    it("Get task user Id with database error", async () => {
        vi.spyOn(Task, "findByPk").mockRejectedValue(
            new Error("Database error")
        );

        try {
            await TaskRepository.getTaskUserId("1");

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });
});