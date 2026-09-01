import { afterEach, assert, describe, expect, it, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import ProjectController from "../../src/controllers/projectController";
import ProjectService from "../../src/services/projectService";
import MissingRequiredDataException from "../../src/exceptions/missingRequiredDataException";
import ForbiddenException from "../../src/exceptions/forbiddenException";
import Project from "../../src/models/project";

describe("ProjectController", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Create a new valid project", async () => {
        const req = {
            userId: "1",
            body: {
                name: "Test Project",
                description: "Test description",
            },
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        vi.spyOn(ProjectService, "createProject").mockResolvedValue({
            id: "1",
            name: "Test Project",
            description: "Test description",
            userId: "1",
        } as Project);

        await ProjectController.createProject(req, res, next);

        expect(ProjectService.createProject).toHaveBeenCalledWith(
            {
                name: "Test Project",
                description: "Test description",
            },
            "1"
        );

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            id: "1",
            name: "Test Project",
            description: "Test description",
            userId: "1",
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("Create a project without user ID", async () => {
        const req = {
            userId: undefined,
            body: {
                name: "Test Project",
                description: "Test description",
            },
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        await ProjectController.createProject(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(ForbiddenException)
        );
    });

    it("Create a project without required data", async () => {
        const req = {
            userId: "1",
            body: {
                description: "Test description",
            },
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        await ProjectController.createProject(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Missing required project data.",
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("Create a project with only name", async () => {
        const req = {
            userId: "1",
            body: {
                name: "Test Project",
            },
        } as any;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        vi.spyOn(ProjectService, "createProject").mockResolvedValue({
            id: "1",
            name: "Test Project",
            description: null,
            userId: "1",
        } as Project);

        await ProjectController.createProject(req, res, next);

        expect(ProjectService.createProject).toHaveBeenCalledWith(
            {
                name: "Test Project",
                description: null,
            },
            "1"
        );

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            id: "1",
            name: "Test Project",
            description: null,
            userId: "1",
        });
    });

    it("Get a project by valid ID", async () => {
        const req = {
            userId: "1",
            params: {
                projectId: "1",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        vi.spyOn(ProjectService, "getProjectById").mockResolvedValue({
            id: "1",
            name: "Test Project",
            description: "Test description",
            userId: "1",
        } as Project);

        await ProjectController.getProjectById(req, res, next);

        expect(ProjectService.getProjectById).toHaveBeenCalledWith(
            "1",
            "1"
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            id: "1",
            name: "Test Project",
            description: "Test description",
            userId: "1",
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("Get a project without user ID", async () => {
        const req = {
            userId: undefined,
            params: {
                projectId: "1",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        await ProjectController.getProjectById(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(ForbiddenException)
        );
    });

    it("Get a project without project ID", async () => {
        const req = {
            userId: "1",
            params: {},
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        await ProjectController.getProjectById(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Update a project successfully", async () => {
        const req = {
            userId: "1",
            params: {
                projectId: "1",
            },
            body: {
                name: "Updated Project",
                description: "Updated description",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        vi.spyOn(ProjectService, "updateProject").mockResolvedValue({
            id: "1",
            name: "Updated Project",
            description: "Updated description",
            userId: "1",
        } as Project);

        await ProjectController.updateProject(req, res, next);

        expect(ProjectService.updateProject).toHaveBeenCalledWith(
            "1",
            {
                name: "Updated Project",
                description: "Updated description",
            },
            "1"
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            id: "1",
            name: "Updated Project",
            description: "Updated description",
            userId: "1",
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("Update a project without user ID", async () => {
        const req = {
            userId: undefined,
            params: {
                projectId: "1",
            },
            body: {
                name: "Updated Project",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        await ProjectController.updateProject(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(ForbiddenException)
        );
    });

    it("Update a project without project ID", async () => {
        const req = {
            userId: "1",
            params: {},
            body: {
                name: "Updated Project",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        await ProjectController.updateProject(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Update a project without update data", async () => {
        const req = {
            userId: "1",
            params: {
                projectId: "1",
            },
            body: {},
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        await ProjectController.updateProject(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Delete a project successfully", async () => {
        const req = {
            userId: "1",
            params: {
                projectId: "1",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        vi.spyOn(ProjectService, "deleteProject").mockResolvedValue();

        await ProjectController.deleteProject(req, res, next);

        expect(ProjectService.deleteProject).toHaveBeenCalledWith(
            "1",
            "1"
        );

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();

        expect(next).not.toHaveBeenCalled();
    });

    it("Delete a project without user ID", async () => {
        const req = {
            userId: undefined,
            params: {
                projectId: "1",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        await ProjectController.deleteProject(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(ForbiddenException)
        );
    });

    it("Delete a project without project ID", async () => {
        const req = {
            userId: "1",
            params: {},
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        await ProjectController.deleteProject(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Get user projects successfully", async () => {
        const req = {
            userId: "1",
            query: {
                page: "1",
                limit: "10",
                sortBy: "name",
                sortOrder: "asc",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        const mockResponse = {
            projects: [
                {
                    id: "1",
                    name: "Project 1",
                    description: "Description 1",
                    userId: "1",
                },
                {
                    id: "2",
                    name: "Project 2",
                    description: "Description 2",
                    userId: "1",
                },
            ] as Project[],
            total: 2,
        };

        vi.spyOn(ProjectService, "getProjectsByUserId").mockResolvedValue(
            mockResponse
        );

        await ProjectController.getUserProjects(req, res, next);

        expect(ProjectService.getProjectsByUserId).toHaveBeenCalledWith(
            "1",
            1,
            10,
            "name",
            "asc",
            undefined
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            projects: mockResponse.projects,
            total: 2,
            page: 1,
            limit: 10,
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("Get user projects with default query parameters", async () => {
        const req = {
            userId: "1",
            query: {},
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        vi.spyOn(ProjectService, "getProjectsByUserId").mockResolvedValue({
            projects: [],
            total: 0,
        });

        await ProjectController.getUserProjects(req, res, next);

        expect(ProjectService.getProjectsByUserId).toHaveBeenCalledWith(
            "1",
            1,
            10,
            "createdAt",
            "asc",
            undefined
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            projects: [],
            total: 0,
            page: 1,
            limit: 10,
        });
    });

    it("Get user projects without user ID", async () => {
        const req = {
            userId: undefined,
            query: {},
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        await ProjectController.getUserProjects(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(ForbiddenException)
        );
    });

    it("Get user projects with invalid page", async () => {
        const req = {
            userId: "1",
            query: {
                page: "0",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        await ProjectController.getUserProjects(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Get user projects with invalid limit", async () => {
        const req = {
            userId: "1",
            query: {
                limit: "0",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        await ProjectController.getUserProjects(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Get user projects with invalid sortBy", async () => {
        const req = {
            userId: "1",
            query: {
                sortBy: "invalid",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        await ProjectController.getUserProjects(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Get user projects with invalid sortOrder", async () => {
        const req = {
            userId: "1",
            query: {
                sortOrder: "invalid",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        await ProjectController.getUserProjects(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(MissingRequiredDataException)
        );
    });

    it("Get user projects with descending order", async () => {
        const req = {
            userId: "1",
            query: {
                page: "2",
                limit: "5",
                sortBy: "updatedAt",
                sortOrder: "desc",
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        vi.spyOn(ProjectService, "getProjectsByUserId").mockResolvedValue({
            projects: [],
            total: 0,
        });

        await ProjectController.getUserProjects(req, res, next);

        expect(ProjectService.getProjectsByUserId).toHaveBeenCalledWith(
            "1",
            2,
            5,
            "updatedAt",
            "desc",
            undefined
        );
    });
});