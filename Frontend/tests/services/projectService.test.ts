import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
} from "../../src/services/projectService";

describe("projectService", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("getProjects", () => {
        it("should successfully get projects", async () => {
            const responseData = {
                projects: [
                    {
                        id: "1",
                        name: "Project 1",
                        description: "Project description",
                    },
                ],
                total: 1,
            };

            const axiosGet = vi
                .spyOn(axios, "get")
                .mockResolvedValue({
                    data: responseData,
                });

            const options = {
                page: 1,
                pageSize: 10,
                sortBy: "createdAt",
                sortOrder: "desc",
            };

            const result = await getProjects(options);

            expect(result).toEqual(responseData);

            expect(axiosGet).toHaveBeenCalledWith(
                expect.stringContaining("/projects"),
                {
                    withCredentials: true,
                    params: {
                        page: 1,
                        limit: 10,
                        sortBy: "createdAt",
                        sortOrder: "desc",
                    },
                }
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error("Failed to get projects");

            vi.spyOn(axios, "get").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await getProjects({
                    page: 1,
                    pageSize: 10,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                });
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });

    describe("getProjectById", () => {
        it("should successfully get a project by id", async () => {
            const responseData = {
                id: "123",
                name: "Test Project",
                description: "Test description",
            };

            const axiosGet = vi
                .spyOn(axios, "get")
                .mockResolvedValue({
                    data: responseData,
                });

            const projectId = "123";

            const result = await getProjectById(projectId);

            expect(result).toEqual(responseData);

            expect(axiosGet).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/projects/${projectId}`
                ),
                {
                    withCredentials: true,
                }
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error("Project not found");

            vi.spyOn(axios, "get").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await getProjectById("123");
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });

    describe("createProject", () => {
        it("should successfully create a project", async () => {
            const projectData = {
                name: "New Project",
                description: "New project description",
            };

            const responseData = {
                id: "123",
                ...projectData,
            };

            const axiosPost = vi
                .spyOn(axios, "post")
                .mockResolvedValue({
                    data: responseData,
                });

            const result = await createProject(projectData);

            expect(result).toEqual(responseData);

            expect(axiosPost).toHaveBeenCalledWith(
                expect.stringContaining("/projects"),
                projectData,
                {
                    withCredentials: true,
                }
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error("Failed to create project");

            vi.spyOn(axios, "post").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await createProject({
                    name: "New Project",
                    description: "Description",
                });
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });

    describe("updateProject", () => {
        it("should successfully update a project", async () => {
            const projectId = "123";

            const updatedData = {
                name: "Updated Project",
                description: "Updated description",
            };

            const responseData = {
                id: projectId,
                ...updatedData,
            };

            const axiosPut = vi
                .spyOn(axios, "put")
                .mockResolvedValue({
                    data: responseData,
                });

            const result = await updateProject(
                projectId,
                updatedData
            );

            expect(result).toEqual(responseData);

            expect(axiosPut).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/projects/${projectId}`
                ),
                updatedData,
                {
                    withCredentials: true,
                }
            );
        });

        it("should successfully update only the project name", async () => {
            const projectId = "123";

            const updatedData = {
                name: "Updated Project",
            };

            const responseData = {
                id: projectId,
                name: "Updated Project",
                description: "Old description",
            };

            const axiosPut = vi
                .spyOn(axios, "put")
                .mockResolvedValue({
                    data: responseData,
                });

            const result = await updateProject(
                projectId,
                updatedData
            );

            expect(result).toEqual(responseData);

            expect(axiosPut).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/projects/${projectId}`
                ),
                updatedData,
                {
                    withCredentials: true,
                }
            );
        });

        it("should successfully update only the project description", async () => {
            const projectId = "123";

            const updatedData = {
                description: "Updated description",
            };

            const responseData = {
                id: projectId,
                name: "Project",
                description: "Updated description",
            };

            const axiosPut = vi
                .spyOn(axios, "put")
                .mockResolvedValue({
                    data: responseData,
                });

            const result = await updateProject(
                projectId,
                updatedData
            );

            expect(result).toEqual(responseData);

            expect(axiosPut).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/projects/${projectId}`
                ),
                updatedData,
                {
                    withCredentials: true,
                }
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error("Failed to update project");

            vi.spyOn(axios, "put").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await updateProject(
                    "123",
                    {
                        name: "Updated Project",
                    }
                );
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });

    describe("deleteProject", () => {
        it("should successfully delete a project", async () => {
            const axiosDelete = vi
                .spyOn(axios, "delete")
                .mockResolvedValue({
                    data: {
                        message: "Project deleted successfully",
                    },
                });

            const projectId = "123";

            const result = await deleteProject(projectId);

            expect(result).toBeUndefined();

            expect(axiosDelete).toHaveBeenCalledWith(
                expect.stringContaining(
                    `/projects/${projectId}`
                ),
                {
                    withCredentials: true,
                }
            );
        });

        it("should propagate an axios error", async () => {
            const error = new Error("Failed to delete project");

            vi.spyOn(axios, "delete").mockRejectedValue(error);

            let thrownError: unknown;

            try {
                await deleteProject("123");
            } catch (err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(error);
        });
    });
});