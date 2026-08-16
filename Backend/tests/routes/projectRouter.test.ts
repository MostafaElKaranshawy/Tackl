import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";
import projectRouter from "../../src/routes/projectRouter";
import NotFoundException from "../../src/exceptions/notFoundException";

const mocks = vi.hoisted(() => ({
    createProject: vi.fn(),
    getProjectById: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    getProjectsByUserId: vi.fn(),
    checkUser: vi.fn(),
}));


vi.mock("../../src/services/projectService", () => ({
    default: {
        createProject: mocks.createProject,
        getProjectById: mocks.getProjectById,
        updateProject: mocks.updateProject,
        deleteProject: mocks.deleteProject,
        getProjectsByUserId: mocks.getProjectsByUserId,
    },
}));

vi.mock("../../src/middlewares/checkUser", () => ({
    default: mocks.checkUser,
}));

const app = express();

app.use(express.json());
app.use("/api/projects", mocks.checkUser,projectRouter);

describe("Project Router", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.checkUser.mockImplementation((req, res, next) => {
            req.userId = "user-id";
            req.tokenPurpose = "accessToken";
            next();
        });
    });

    describe("POST /api/projects", () => {
        it("should create a new project and return 201 status", async () => {
            const mockProject = {
                id: "1",
                name: "Test Project",
                description: "A test project",
            };

            mocks.createProject.mockResolvedValue(mockProject);

            const response = await request(app)
                .post("/api/projects")
                .send({
                    name: "Test Project",
                    description: "A test project",
                });
            
            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockProject);

            expect(mocks.createProject).toHaveBeenCalledTimes(1);
            expect(mocks.createProject).toHaveBeenCalledWith(
                {
                    name: "Test Project",
                    description: "A test project",
                },
                "user-id",
            );
        });

        it("should return 400 if required data is missing", async () => {
            const response = await request(app)
                .post("/api/projects")
                .send({
                    description: "A test project",
                });

            expect(response.status).toBe(400);

            expect(response.body).toHaveProperty(
                "message",
                "Missing required project data.",
            );

            expect(mocks.createProject).not.toHaveBeenCalled();
        });
    });

    describe("GET /api/projects/:projectId", () => {
        it("should return a project by ID and return 200 status", async () => {
            const mockProject = {
                id: "1",
                name: "Test Project",
                description: "A test project",
            };

            mocks.getProjectById.mockResolvedValue(mockProject);

            const response = await request(app)
                .get("/api/projects/1");

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockProject);

            expect(mocks.getProjectById).toHaveBeenCalledTimes(1);
            expect(mocks.getProjectById).toHaveBeenCalledWith(
                "1",
                "user-id",
            );
        });

        it("should return 404 if project does not exist", async () => {
            mocks.getProjectById.mockRejectedValue(new NotFoundException("Project not found."));

            const response = await request(app)
                .get("/api/projects/1");

            expect(response.status).toBe(404);

            expect(mocks.getProjectById).toHaveBeenCalledWith(
                "1",
                "user-id",
            );
        });
    });

    describe("PUT /api/projects/:projectId", () => {
        it("should update a project and return 200 status", async () => {
            const updatedProject = {
                id: "1",
                name: "Updated Project",
                description: "Updated description",
            };

            mocks.updateProject.mockResolvedValue(updatedProject);

            const response = await request(app)
                .put("/api/projects/1")
                .send({
                    name: "Updated Project",
                    description: "Updated description",
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedProject);

            expect(mocks.updateProject).toHaveBeenCalledTimes(1);
        });

        it("should return 404 if project does not exist", async () => {
            mocks.updateProject.mockRejectedValue(new NotFoundException("Project not found."));

            const response = await request(app)
                .put("/api/projects/1")
                .send({
                    name: "Updated Project",
                });

            expect(response.status).toBe(404);
        });
    });

    describe("DELETE /api/projects/:projectId", () => {
        it("should delete a project and return 200 status", async () => {
            mocks.deleteProject.mockResolvedValue(true);

            const response = await request(app)
                .delete("/api/projects/1");

            expect(response.status).toBe(204);

            expect(mocks.deleteProject).toHaveBeenCalledTimes(1);
            expect(mocks.deleteProject).toHaveBeenCalledWith(
                "1",
                "user-id",
            );
        });

        it("should return 404 if project does not exist", async () => {
            mocks.deleteProject.mockRejectedValue(new NotFoundException("Project not found."));

            const response = await request(app)
                .delete("/api/projects/1");

            expect(response.status).toBe(404);
        });
    });

    describe("GET /api/projects", () => {
        it("should return the user's projects", async () => {
            const projects = [
                {
                    id: "1",
                    name: "Project 1",
                    description: "Description 1",
                },
                {
                    id: "2",
                    name: "Project 2",
                    description: "Description 2",
                },
            ];

            mocks.getProjectsByUserId.mockResolvedValue({total: 2, projects, page: 1, limit: 10 });

            const response = await request(app)
                .get("/api/projects");
            
                console.log(response);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({total: 2, projects, page: 1, limit: 10});

            expect(mocks.getProjectsByUserId).toHaveBeenCalledTimes(1);
            expect(mocks.getProjectsByUserId).toHaveBeenCalledWith(
                "user-id",
                1,
                10,
                "createdAt",
                "asc"
            );
        });
    });

    describe("Unknown routes", () => {
        it("should return 404 for an unknown project route", async () => {
            const response = await request(app)
                .get("/api/projects/does-not-exist/unknown");

            expect(response.status).toBe(404);
        });
    });
});