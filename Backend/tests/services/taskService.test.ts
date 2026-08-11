import { afterEach, assert, describe, expect, it, vi } from "vitest";
import TaskService from "../../src/services/taskService";
import Task from "../../src/models/task";
import TaskRepository from "../../src/repositories/taskRepository";
import ProjectRepository from "../../src/repositories/projectRepository";
import TaskHistoryRepository from "../../src/repositories/taskHistoryRepository";
import ForbiddenException from "../../src/exceptions/forbiddenException";
import NotFoundException from "../../src/exceptions/notFoundException";
import { ActionType } from "../../src/enums/actionType";
import QueryParams from "../../src/interfaces/QueryParams";

describe("TaskService", () => {

    afterEach(() => {
        vi.restoreAllMocks();
    });


    it("Create a new valid task", async () => {

        vi.spyOn(ProjectRepository, "getProjectById").mockResolvedValue({
            id: "1",
            userId: "1",
        } as any);

        vi.spyOn(TaskRepository, "createTask").mockResolvedValue({
            id: "1",
            title: "Test Task",
            description: "This is a test task",
            projectId: "1",
        } as Task);

        vi.spyOn(TaskHistoryRepository, "createTaskHistory")
            .mockResolvedValue();

        const taskData = {
            title: "Test Task",
            description: "This is a test task",
        };

        const result = await TaskService.createTask(
            taskData,
            "1",
            "1"
        );

        expect(result).toEqual({
            id: "1",
            title: "Test Task",
            description: "This is a test task",
            projectId: "1",
        });

    });


    it("Create a task with an invalid project Id", async () => {

        vi.spyOn(ProjectRepository, "getProjectById")
            .mockResolvedValue(null);

        try {

            await TaskService.createTask(
                {
                    title: "Test Task",
                    description: "This is a test task",
                },
                "1",
                "1"
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


    it("Create a task with a different project owner", async () => {

        vi.spyOn(ProjectRepository, "getProjectById")
            .mockResolvedValue({
                id: "1",
                userId: "2",
            } as any);

        try {

            await TaskService.createTask(
                {
                    title: "Test Task",
                    description: "This is a test task",
                },
                "1",
                "1"
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


    it("Get a valid task by Id", async () => {

        vi.spyOn(TaskRepository, "getTaskById")
            .mockResolvedValue({
                id: "1",
                title: "Test Task",
                description: "This is a test task",
                projectId: "1",
            } as Task);

        const result = await TaskService.getTaskById(
            "1",
            "1",
            "1"
        );

        expect(result).toEqual({
            id: "1",
            title: "Test Task",
            description: "This is a test task",
            projectId: "1",
        });

    });


    it("Get a task with an invalid Id", async () => {

        vi.spyOn(TaskRepository, "getTaskById")
            .mockResolvedValue(null);

        const result = await TaskService.getTaskById(
            "1",
            "1",
            "1"
        );

        expect(result).toBeNull();

    });


    it("Update a task", async () => {

        vi.spyOn(TaskRepository, "getTaskById")
            .mockResolvedValue({
                id: "1",
                title: "Test Task",
                description: "Old description",
                projectId: "1",
            } as Task);

        vi.spyOn(TaskRepository, "updateTask")
            .mockResolvedValue({
                id: "1",
                title: "Updated Task",
                description: "Old description",
                projectId: "1",
            } as Task);

        vi.spyOn(TaskHistoryRepository, "createTaskHistory")
            .mockResolvedValue();

        const taskData = {
            title: "Updated Task",
        };

        const result = await TaskService.updateTask(
            "1",
            "1",
            taskData,
            "1"
        );

        expect(result).toEqual({
            id: "1",
            title: "Updated Task",
            description: "Old description",
            projectId: "1",
        });

    });


    it("Update a task with invalid Id", async () => {

        vi.spyOn(TaskRepository, "getTaskById")
            .mockResolvedValue(null);

        try {

            await TaskService.updateTask(
                "1",
                "1",
                {
                    title: "Updated Task",
                },
                "1"
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


    it("Update a task and record the changes", async () => {

        vi.spyOn(TaskRepository, "getTaskById")
            .mockResolvedValue({
                id: "1",
                title: "Old Task",
                description: "Old description",
                projectId: "1",
            } as Task);

        vi.spyOn(TaskRepository, "updateTask")
            .mockResolvedValue({
                id: "1",
                title: "New Task",
                description: "New description",
                projectId: "1",
            } as Task);

        const historySpy = vi.spyOn(
            TaskHistoryRepository,
            "createTaskHistory"
        ).mockResolvedValue();

        await TaskService.updateTask(
            "1",
            "1",
            {
                title: "New Task",
                description: "New description",
            },
            "1"
        );

        expect(historySpy).toHaveBeenCalledWith(
            "1",
            "1",
            ActionType.UPDATED,
            "Task",
            expect.arrayContaining([
                expect.objectContaining({
                    fieldName: "title",
                    oldValue: "Old Task",
                    newValue: "New Task",
                    actionType: ActionType.UPDATED,
                }),
                expect.objectContaining({
                    fieldName: "description",
                    oldValue: "Old description",
                    newValue: "New description",
                    actionType: ActionType.UPDATED,
                }),
            ])
        );

    });


    it("Update a task with a deleted field", async () => {

        vi.spyOn(TaskRepository, "getTaskById")
            .mockResolvedValue({
                id: "1",
                title: "Test Task",
                description: "Old description",
                projectId: "1",
            } as Task);

        vi.spyOn(TaskRepository, "updateTask")
            .mockResolvedValue({
                id: "1",
                title: "Test Task",
                description: null,
                projectId: "1",
            } as Task);

        const historySpy = vi.spyOn(
            TaskHistoryRepository,
            "createTaskHistory"
        ).mockResolvedValue();

        await TaskService.updateTask(
            "1",
            "1",
            {
                description: null,
            },
            "1"
        );

        expect(historySpy).toHaveBeenCalledWith(
            "1",
            "1",
            ActionType.UPDATED,
            "Task",
            expect.arrayContaining([
                expect.objectContaining({
                    fieldName: "description",
                    oldValue: "Old description",
                    newValue: null,
                    actionType: ActionType.DELETED,
                }),
            ])
        );

    });


    it("Delete a task", async () => {

        vi.spyOn(TaskRepository, "deleteTask")
            .mockResolvedValue();

        try {

            await TaskService.deleteTask(
                "1",
                "1",
                "1"
            );

        } catch {

            assert.fail(
                "Expected no exception to be thrown"
            );

        }

    });


    it("Delete a task with invalid Id", async () => {

        vi.spyOn(TaskRepository, "deleteTask")
            .mockRejectedValue(
                new NotFoundException("Task not found.")
            );

        try {

            await TaskService.deleteTask(
                "1",
                "1",
                "1"
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


    it("Get project tasks", async () => {

        const mockResponse = {
            tasks: [
                {
                    id: "1",
                    title: "Test Task 1",
                    description: "Description 1",
                    projectId: "1",
                } as Task,

                {
                    id: "2",
                    title: "Test Task 2",
                    description: "Description 2",
                    projectId: "1",
                } as Task,
            ],
            total: 2,
        };

        vi.spyOn(ProjectRepository, "getProjectById")
            .mockResolvedValue({
                id: "1",
                userId: "1",
            } as any);

        vi.spyOn(TaskRepository, "getProjectTasks")
            .mockResolvedValue(mockResponse);

        const queryParams = {
            page: 1,
            limit: 10,
            sortBy: "createdAt",
            sortOrder: "asc",
        } as QueryParams;

        const result = await TaskService.getProjectTasks(
            "1",
            "1",
            queryParams
        );

        expect(result).toEqual(mockResponse);

    });


    it("Get project tasks with invalid project Id", async () => {

        vi.spyOn(ProjectRepository, "getProjectById")
            .mockResolvedValue(null);

        try {

            await TaskService.getProjectTasks(
                "1",
                "1",
                {} as QueryParams
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


    it("Get project tasks with a different project owner", async () => {

        vi.spyOn(ProjectRepository, "getProjectById")
            .mockResolvedValue({
                id: "1",
                userId: "2",
            } as any);

        try {

            await TaskService.getProjectTasks(
                "1",
                "1",
                {} as QueryParams
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


    it("Get all project tasks", async () => {

        const mockTasks = [
            {
                id: "1",
                title: "Test Task 1",
                description: "Description 1",
                projectId: "1",
            } as Task,

            {
                id: "2",
                title: "Test Task 2",
                description: "Description 2",
                projectId: "1",
            } as Task,
        ];

        vi.spyOn(ProjectRepository, "getProjectById")
            .mockResolvedValue({
                id: "1",
                userId: "1",
            } as any);

        vi.spyOn(TaskRepository, "getAllProjectTasks")
            .mockResolvedValue(mockTasks);

        const result = await TaskService.getAllProjectTasks(
            "1",
            "1",
            "createdAt",
            "asc"
        );

        expect(result).toEqual(mockTasks);

    });


    it("Get all project tasks with invalid project Id", async () => {

        vi.spyOn(ProjectRepository, "getProjectById")
            .mockResolvedValue(null);

        try {

            await TaskService.getAllProjectTasks(
                "1",
                "1",
                "createdAt",
                "asc"
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


    it("Get all project tasks with a different project owner", async () => {

        vi.spyOn(ProjectRepository, "getProjectById")
            .mockResolvedValue({
                id: "1",
                userId: "2",
            } as any);

        try {

            await TaskService.getAllProjectTasks(
                "1",
                "1",
                "createdAt",
                "asc"
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