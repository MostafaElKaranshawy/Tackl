import { afterEach, assert, describe, expect, it, vi } from "vitest";
import ProjectService from "../../src/services/projectService";
import Project from "../../src/models/project";
import ProjectRepository from "../../src/repositories/projectRepository";
import ForbiddenException from "../../src/exceptions/forbiddenException";
import NotFoundException from "../../src/exceptions/notFoundException";

describe("ProjectService", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Create a new valid project", async () => {
        vi.spyOn(ProjectRepository, "createProject").mockResolvedValue({
            id: "1",
            name: "Test Project",
            description: "This is a test project",
            userId: "1",
        } as Project);

        const projectData = {
            name: "Test Project",
            description: "This is a test project",
        };

        const result = await ProjectService.createProject(projectData, "1");
        expect(result).toEqual({
            id: "1",
            name: "Test Project",
            description: "This is a test project",
            userId: "1",
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Get a valid project by Id", async () => {
        vi.spyOn(ProjectRepository, "getProjectById").mockResolvedValue({
            id: "1",
            name: "Test Project",
            description: "This is a test project",
            userId: "1",
        } as Project);

        const result = await ProjectService.getProjectById("1", "1");
        expect(result).toEqual({
            id: "1",
            name: "Test Project",
            description: "This is a test project",
            userId: "1",
        });
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Get a valid project by Id but with a different user", async () => {
        vi.spyOn(ProjectRepository, "getProjectById").mockResolvedValue({
            id: "1",
            name: "Test Project",
            description: "This is a test project",
            userId: "1",
        } as Project);
        try {
            await ProjectService.getProjectById("1", "2");
            assert.fail("Expected ForbiddenException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenException);
        }
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Get a project by wrong Id", async () => {
        vi.spyOn(Project, "findByPk").mockResolvedValue(null);
        try {
            await ProjectService.getProjectById("1", "2");
            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Update a project", async () => {
        vi.spyOn(ProjectRepository, "getProjectById").mockResolvedValue({
            id: "1",
            name: "Test Project",
            description: "This is a test project",
            userId: "1",
        } as Project);

        vi.spyOn(ProjectRepository, "updateProject").mockResolvedValue({
            id: "1",
            name: "Updated Project",
            description: "This is a test project",
            userId: "1",
        } as Project);

        const projectData = {
            name: "Updated Project",
            description: "This is a test project",
        };

        const result = await ProjectService.updateProject("1", projectData, "1");
        expect(result).toEqual({
            id: "1",
            name: "Updated Project",
            description: "This is a test project",
            userId: "1",
        });
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Update a project with invalid Id", async () => {
        vi.spyOn(Project, "findByPk").mockResolvedValue(null);

        vi.spyOn(ProjectRepository, "updateProject").mockResolvedValue({
            id: "1",
            name: "Updated Project",
            description: "This is a test project",
            userId: "1",
        } as Project);

        const projectData = {
            name: "Updated Project",
            description: "This is a test project",
        };
        try {
            await ProjectService.updateProject("1", projectData, "1");
            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Update a project with valid userId", async () => {
        vi.spyOn(ProjectRepository, "getProjectById").mockResolvedValue({
            id: "1",
            name: "Test Project",
            description: "This is a test project",
            userId: "2",
        } as Project);

        const projectData = {
            name: "Updated Project",
            description: "This is a test project",
        };
        try {
            await ProjectService.updateProject("1", projectData, "1");
            assert.fail("Expected ForbiddenException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenException);
        }
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Delete a project", async () => {
        vi.spyOn(ProjectRepository, "getProjectById").mockResolvedValue({
            id: "1",
            name: "Test Project",
            description: "This is a test project",
            userId: "1",
        } as Project);

        vi.spyOn(ProjectRepository, "deleteProject").mockResolvedValue();

        try {
            const result = await ProjectService.deleteProject("1", "1");
        } catch {
            assert.fail("Expected no exception to be thrown");
        }
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Delete a project with invalid Id", async () => {
        vi.spyOn(Project, "findByPk").mockResolvedValue(null);

        vi.spyOn(ProjectRepository, "deleteProject").mockResolvedValue();

        try {
            await ProjectService.deleteProject("1", "1");
            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Delete a project with valid userId", async () => {
        vi.spyOn(ProjectRepository, "getProjectById").mockResolvedValue({
            id: "1",
            name: "Test Project",
            description: "This is a test project",
            userId: "2",
        } as Project);

        try {
            await ProjectService.deleteProject("1", "1");
            assert.fail("Expected ForbiddenException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(ForbiddenException);
        }
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Get projects by userId", async () => {
        const mockResponse = {
            projects: [
                {
                    id: "1",
                    name: "Test Project 1",
                    description: "This is a test project 1",
                    userId: "1",
                } as Project,
                {
                    id: "2",
                    name: "Test Project 2",
                    description: "This is a test project 2",
                    userId: "1",
                } as Project,
            ],
            total: 2,
        } as { projects: Project[], total: number }
        vi.spyOn(ProjectRepository, "getUserProjects").mockResolvedValue(mockResponse);

        const result = await ProjectService.getProjectsByUserId("1", 1, 10, "name", "asc");
        expect(result).toEqual(mockResponse);
    });
});