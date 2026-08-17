import { afterEach, assert, describe, expect, it, vi } from "vitest";
import ProjectRepository from "../../src/repositories/projectRepository";
import Project from "../../src/models/project";
import DBException from "../../src/exceptions/dbException";
import MissingRequiredDataException from "../../src/exceptions/missingRequiredDataException";
import NotFoundException from "../../src/exceptions/notFoundException";

describe("ProjectRepository", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Create a new valid project", async () => {
        vi.spyOn(Project, "create").mockResolvedValue({
            id: "1",
            name: "Test Project",
            description: "Test description",
            userId: "1",
        } as Project);

        const result = await ProjectRepository.createProject(
            {
                name: "Test Project",
                description: "Test description",
            },
            "1"
        );

        expect(result).toEqual({
            id: "1",
            name: "Test Project",
            description: "Test description",
            userId: "1",
        });
    });

    it("Create a project without a name", async () => {
        try {
            await ProjectRepository.createProject(
                {
                    description: "Test description",
                },
                "1"
            );

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Create a project with a database error", async () => {
        vi.spyOn(Project, "create").mockRejectedValue(
            new Error("Database error")
        );

        try {
            await ProjectRepository.createProject(
                {
                    name: "Test Project",
                    description: "Test description",
                },
                "1"
            );

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Get a project by valid Id", async () => {
        vi.spyOn(Project, "findByPk").mockResolvedValue({
            id: "1",
            name: "Test Project",
            description: "Test description",
            userId: "1",
        } as Project);

        const result = await ProjectRepository.getProjectById("1");

        expect(result).toEqual({
            id: "1",
            name: "Test Project",
            description: "Test description",
            userId: "1",
        });
    });

    it("Get a project by Id when project does not exist", async () => {
        vi.spyOn(Project, "findByPk").mockResolvedValue(null);

        const result = await ProjectRepository.getProjectById("1");

        expect(result).toBeNull();
    });

    it("Get a project by Id with database error", async () => {
        vi.spyOn(Project, "findByPk").mockRejectedValue(
            new Error("Database error")
        );

        try {
            await ProjectRepository.getProjectById("1");

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Update a project", async () => {
        const project = {
            id: "1",
            name: "Test Project",
            description: "Test description",
            userId: "1",
            update: vi.fn().mockResolvedValue(undefined),
        } as unknown as Project;

        vi.spyOn(Project, "findByPk").mockResolvedValue(project);

        const result = await ProjectRepository.updateProject("1", {
            name: "Updated Project",
            description: "Updated description",
        });

        expect(project.update).toHaveBeenCalledWith({
            name: "Updated Project",
            description: "Updated description",
        });

        expect(result).toBe(project);
    });

    it("Update a project with invalid Id", async () => {
        vi.spyOn(Project, "findByPk").mockResolvedValue(null);

        try {
            await ProjectRepository.updateProject("1", {
                name: "Updated Project",
            });

            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    it("Update a project with database error", async () => {
        const project = {
            id: "1",
            name: "Test Project",
            description: "Test description",
            userId: "1",
            update: vi.fn().mockRejectedValue(
                new Error("Database error")
            ),
        } as unknown as Project;

        vi.spyOn(Project, "findByPk").mockResolvedValue(project);

        try {
            await ProjectRepository.updateProject("1", {
                name: "Updated Project",
            });

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Delete a project", async () => {
        const project = {
            id: "1",
            name: "Test Project",
            description: "Test description",
            userId: "1",
            destroy: vi.fn().mockResolvedValue(undefined),
        } as unknown as Project;

        vi.spyOn(Project, "findByPk").mockResolvedValue(project);

        await ProjectRepository.deleteProject("1");

        expect(project.destroy).toHaveBeenCalled();
    });

    it("Delete a project with invalid Id", async () => {
        vi.spyOn(Project, "findByPk").mockResolvedValue(null);

        try {
            await ProjectRepository.deleteProject("1");

            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    it("Delete a project with database error", async () => {
        const project = {
            id: "1",
            name: "Test Project",
            description: "Test description",
            userId: "1",
            destroy: vi.fn().mockRejectedValue(
                new Error("Database error")
            ),
        } as unknown as Project;

        vi.spyOn(Project, "findByPk").mockResolvedValue(project);

        try {
            await ProjectRepository.deleteProject("1");

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Get projects by userId", async () => {
        const projects = [
            {
                id: "1",
                name: "Test Project 1",
                description: "Description 1",
                userId: "1",
            },
            {
                id: "2",
                name: "Test Project 2",
                description: "Description 2",
                userId: "1",
            },
        ] as Project[];

        vi.spyOn(Project, "findAll").mockResolvedValue(projects);

        vi.spyOn(Project, "count").mockResolvedValue(2);

        const result = await ProjectRepository.getUserProjects(
            "1",
            1,
            10,
            "name",
            "asc"
        );

        expect(result).toEqual({
            projects,
            total: 2,
        });
    });

    it("Get projects by userId with database error", async () => {
        vi.spyOn(Project, "findAll").mockRejectedValue(
            new Error("Database error")
        );

        try {
            await ProjectRepository.getUserProjects(
                "1",
                1,
                10,
                "name",
                "asc"
            );

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Get project userId", async () => {
        vi.spyOn(Project, "findByPk").mockResolvedValue({
            id: "1",
            userId: "1",
        } as Project);

        const result = await ProjectRepository.getProjectUserId("1");

        expect(result).toBe("1");
    });

    it("Get project userId with invalid project Id", async () => {
        vi.spyOn(Project, "findByPk").mockResolvedValue(null);

        try {
            await ProjectRepository.getProjectUserId("1");

            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    it("Get project userId when userId does not exist", async () => {
        vi.spyOn(Project, "findByPk").mockResolvedValue({
            id: "1",
            userId: null,
        } as unknown as Project);

        try {
            await ProjectRepository.getProjectUserId("1");

            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });
});