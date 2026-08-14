import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import ManageProjectCard from "../../../src/components/projectComponents/ManageProjectCard";
import {
    createProject,
    updateProject,
} from "../../../src/services/projectService";
import { notify } from "../../../src/utils/notify";
import type Project from "../../../src/types/project";

vi.mock("../../../src/services/projectService", () => ({
    createProject: vi.fn(),
    updateProject: vi.fn(),
}));

vi.mock("../../../src/utils/notify", () => ({
    notify: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe("ManageProjectCard", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    const mockProject = {
        id: "project-1",
        name: "Test Project",
        description: "Test project description",
    } as Project;

    const renderManageProjectCard = (
        mode: "create" | "edit" = "create",
        project?: Project,
        onSuccess = vi.fn(),
        onClose = vi.fn(),
    ) => {
        return render(
            <ManageProjectCard
                mode={mode}
                project={project}
                onSuccess={onSuccess}
                onClose={onClose}
            />
        );
    };

    describe("initial state", () => {
        it("should display the create project form", () => {
            renderManageProjectCard("create");

            expect(
                screen.getByText("Create New Project")
            ).toBeInTheDocument();

            expect(
                screen.getByPlaceholderText("Enter project name")
            ).toBeInTheDocument();

            expect(
                screen.getByPlaceholderText(
                    "Describe your project..."
                )
            ).toBeInTheDocument();

            expect(
                screen.getByRole("button", {
                    name: "Create Project",
                })
            ).toBeInTheDocument();

            expect(
                screen.getByRole("button", {
                    name: "Cancel",
                })
            ).toBeInTheDocument();
        });

        it("should display the edit project form", () => {
            renderManageProjectCard(
                "edit",
                mockProject
            );

            expect(
                screen.getByText("Edit Project")
            ).toBeInTheDocument();

            expect(
                screen.getByDisplayValue("Test Project")
            ).toBeInTheDocument();

            expect(
                screen.getByDisplayValue(
                    "Test project description"
                )
            ).toBeInTheDocument();

            expect(
                screen.getByRole("button", {
                    name: "Save Changes",
                })
            ).toBeInTheDocument();
        });

        it("should initialize an empty form in create mode", () => {
            renderManageProjectCard("create");

            expect(
                screen.getByPlaceholderText(
                    "Enter project name"
                )
            ).toHaveValue("");

            expect(
                screen.getByPlaceholderText(
                    "Describe your project..."
                )
            ).toHaveValue("");
        });

        it("should initialize the form with project data in edit mode", () => {
            renderManageProjectCard(
                "edit",
                mockProject
            );

            expect(
                screen.getByPlaceholderText(
                    "Enter project name"
                )
            ).toHaveValue("Test Project");

            expect(
                screen.getByPlaceholderText(
                    "Describe your project..."
                )
            ).toHaveValue("Test project description");
        });
    });

    describe("form input", () => {
        it("should update the project name", async () => {
            const user = userEvent.setup();

            renderManageProjectCard();

            const nameInput =
                screen.getByPlaceholderText(
                    "Enter project name"
                );

            await user.type(
                nameInput,
                "New Project"
            );

            expect(nameInput).toHaveValue(
                "New Project"
            );
        });

        it("should update the project description", async () => {
            const user = userEvent.setup();

            renderManageProjectCard();

            const descriptionInput =
                screen.getByPlaceholderText(
                    "Describe your project..."
                );

            await user.type(
                descriptionInput,
                "Project description"
            );

            expect(descriptionInput).toHaveValue(
                "Project description"
            );
        });
    });

    describe("validation", () => {
        it("should display an error when project name is empty", async () => {
            const user = userEvent.setup();

            renderManageProjectCard();

            await user.click(
                screen.getByRole("button", {
                    name: "Create Project",
                })
            );

            expect(
                screen.getByText(
                    "Project name cannot be empty."
                )
            ).toBeInTheDocument();

            expect(createProject).not.toHaveBeenCalled();
        });

        it("should display an error when project name contains only whitespace", async () => {
            const user = userEvent.setup();

            renderManageProjectCard();

            const nameInput =
                screen.getByPlaceholderText(
                    "Enter project name"
                );

            await user.type(nameInput, "   ");

            await user.click(
                screen.getByRole("button", {
                    name: "Create Project",
                })
            );

            expect(
                screen.getByText(
                    "Project name cannot be empty."
                )
            ).toBeInTheDocument();

            expect(createProject).not.toHaveBeenCalled();
        });

        it("should clear the name error when the user starts typing", async () => {
            const user = userEvent.setup();

            renderManageProjectCard();

            await user.click(
                screen.getByRole("button", {
                    name: "Create Project",
                })
            );

            expect(
                screen.getByText(
                    "Project name cannot be empty."
                )
            ).toBeInTheDocument();

            await user.type(
                screen.getByPlaceholderText(
                    "Enter project name"
                ),
                "New Project"
            );

            expect(
                screen.queryByText(
                    "Project name cannot be empty."
                )
            ).not.toBeInTheDocument();
        });
    });

    describe("create mode", () => {
        it("should call createProject with the correct data", async () => {
            const user = userEvent.setup();

            vi.mocked(createProject).mockResolvedValue(
                mockProject
            );

            const onSuccess = vi.fn();

            renderManageProjectCard(
                "create",
                undefined,
                onSuccess
            );

            await user.type(
                screen.getByPlaceholderText(
                    "Enter project name"
                ),
                "  New Project  "
            );

            await user.type(
                screen.getByPlaceholderText(
                    "Describe your project..."
                ),
                "  Project description  "
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Create Project",
                })
            );

            await waitFor(() => {
                expect(createProject).toHaveBeenCalledWith({
                    name: "New Project",
                    description: "Project description",
                });
            });
        });

        it("should call onSuccess with the created project", async () => {
            const user = userEvent.setup();

            vi.mocked(createProject).mockResolvedValue(
                mockProject
            );

            const onSuccess = vi.fn();

            renderManageProjectCard(
                "create",
                undefined,
                onSuccess
            );

            await user.type(
                screen.getByPlaceholderText(
                    "Enter project name"
                ),
                "New Project"
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Create Project",
                })
            );

            await waitFor(() => {
                expect(onSuccess).toHaveBeenCalledWith(
                    mockProject
                );
            });
        });

        it("should display a success notification after creating a project", async () => {
            const user = userEvent.setup();

            vi.mocked(createProject).mockResolvedValue(
                mockProject
            );

            renderManageProjectCard();

            await user.type(
                screen.getByPlaceholderText(
                    "Enter project name"
                ),
                "New Project"
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Create Project",
                })
            );

            await waitFor(() => {
                expect(notify.success).toHaveBeenCalledWith(
                    "Project created successfully!"
                );
            });
        });

        it("should close the modal after successfully creating a project", async () => {
            const user = userEvent.setup();

            vi.mocked(createProject).mockResolvedValue(
                mockProject
            );

            const onClose = vi.fn();

            renderManageProjectCard(
                "create",
                undefined,
                vi.fn(),
                onClose
            );

            await user.type(
                screen.getByPlaceholderText(
                    "Enter project name"
                ),
                "New Project"
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Create Project",
                })
            );

            await waitFor(() => {
                expect(onClose).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("edit mode", () => {
        it("should call updateProject with the correct data", async () => {
            const user = userEvent.setup();

            vi.mocked(updateProject).mockResolvedValue(
                mockProject
            );

            renderManageProjectCard(
                "edit",
                mockProject
            );

            const nameInput =
                screen.getByPlaceholderText(
                    "Enter project name"
                );

            await user.clear(nameInput);
            await user.type(
                nameInput,
                "  Updated Project  "
            );

            const descriptionInput =
                screen.getByPlaceholderText(
                    "Describe your project..."
                );

            await user.clear(descriptionInput);
            await user.type(
                descriptionInput,
                "  Updated description  "
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Save Changes",
                })
            );

            await waitFor(() => {
                expect(updateProject).toHaveBeenCalledWith(
                    "project-1",
                    {
                        name: "Updated Project",
                        description: "Updated description",
                    }
                );
            });
        });

        it("should call onSuccess with the updated project", async () => {
            const user = userEvent.setup();

            vi.mocked(updateProject).mockResolvedValue(
                mockProject
            );

            const onSuccess = vi.fn();

            renderManageProjectCard(
                "edit",
                mockProject,
                onSuccess
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Save Changes",
                })
            );

            await waitFor(() => {
                expect(onSuccess).toHaveBeenCalledWith(
                    mockProject
                );
            });
        });

        it("should display a success notification after updating a project", async () => {
            const user = userEvent.setup();

            vi.mocked(updateProject).mockResolvedValue(
                mockProject
            );

            renderManageProjectCard(
                "edit",
                mockProject
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Save Changes",
                })
            );

            await waitFor(() => {
                expect(notify.success).toHaveBeenCalledWith(
                    "Project updated successfully!"
                );
            });
        });

        it("should close the modal after successfully updating a project", async () => {
            const user = userEvent.setup();

            vi.mocked(updateProject).mockResolvedValue(
                mockProject
            );

            const onClose = vi.fn();

            renderManageProjectCard(
                "edit",
                mockProject,
                vi.fn(),
                onClose
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Save Changes",
                })
            );

            await waitFor(() => {
                expect(onClose).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("API errors", () => {
        it("should handle a 400 error", async () => {
            const user = userEvent.setup();

            vi.mocked(createProject).mockRejectedValue({
                isAxiosError: true,
                response: {
                    status: 400,
                },
            });

            renderManageProjectCard();

            await user.type(
                screen.getByPlaceholderText(
                    "Enter project name"
                ),
                "New Project"
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Create Project",
                })
            );

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "Invalid project data."
                );
            });
        });

        it("should handle a 401 error", async () => {
            const user = userEvent.setup();

            vi.mocked(createProject).mockRejectedValue({
                isAxiosError: true,
                response: {
                    status: 401,
                },
            });

            renderManageProjectCard();

            await user.type(
                screen.getByPlaceholderText(
                    "Enter project name"
                ),
                "New Project"
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Create Project",
                })
            );

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "You are not authorized."
                );
            });
        });

        it("should handle a 404 error", async () => {
            const user = userEvent.setup();

            vi.mocked(createProject).mockRejectedValue({
                isAxiosError: true,
                response: {
                    status: 404,
                },
            });

            renderManageProjectCard();

            await user.type(
                screen.getByPlaceholderText(
                    "Enter project name"
                ),
                "New Project"
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Create Project",
                })
            );

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "Project not found."
                );
            });
        });

        it("should handle an unknown API error", async () => {
            const user = userEvent.setup();

            vi.mocked(createProject).mockRejectedValue({
                isAxiosError: true,
                response: {
                    status: 500,
                },
            });

            renderManageProjectCard();

            await user.type(
                screen.getByPlaceholderText(
                    "Enter project name"
                ),
                "New Project"
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Create Project",
                })
            );

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "Something went wrong. Please try again."
                );
            });
        });

        it("should handle a non-Axios error", async () => {
            const user = userEvent.setup();

            vi.mocked(createProject).mockRejectedValue(
                new Error("Something went wrong")
            );

            renderManageProjectCard();

            await user.type(
                screen.getByPlaceholderText(
                    "Enter project name"
                ),
                "New Project"
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Create Project",
                })
            );

            await waitFor(() => {
                expect(notify.error).toHaveBeenCalledWith(
                    "Something went wrong. Please try again."
                );
            });
        });
    });

    describe("loading state", () => {
        it("should display Creating... while creating a project", async () => {
            const user = userEvent.setup();

            let resolveRequest:
                | ((project: Project) => void)
                | undefined;

            vi.mocked(createProject).mockReturnValue(
                new Promise((resolve) => {
                    resolveRequest = resolve;
                })
            );

            renderManageProjectCard();

            await user.type(
                screen.getByPlaceholderText(
                    "Enter project name"
                ),
                "New Project"
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Create Project",
                })
            );

            expect(
                screen.getByRole("button", {
                    name: "Creating...",
                })
            ).toBeInTheDocument();

            expect(
                screen.getByRole("button", {
                    name: "Cancel",
                })
            ).toBeDisabled();

            expect(
                screen.getByRole("button", {
                    name: "Creating...",
                })
            ).toBeDisabled();

            resolveRequest?.(mockProject);

            await waitFor(() => {
                expect(
                    screen.queryByRole("button", {
                        name: "Creating...",
                    })
                ).not.toBeInTheDocument();
            });
        });

        it("should display Saving... while updating a project", async () => {
            const user = userEvent.setup();

            let resolveRequest:
                | ((project: Project) => void)
                | undefined;

            vi.mocked(updateProject).mockReturnValue(
                new Promise((resolve) => {
                    resolveRequest = resolve;
                })
            );

            renderManageProjectCard(
                "edit",
                mockProject
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Save Changes",
                })
            );

            expect(
                screen.getByRole("button", {
                    name: "Saving...",
                })
            ).toBeInTheDocument();

            expect(
                screen.getByRole("button", {
                    name: "Cancel",
                })
            ).toBeDisabled();

            expect(
                screen.getByRole("button", {
                    name: "Saving...",
                })
            ).toBeDisabled();

            resolveRequest?.(mockProject);

            await waitFor(() => {
                expect(
                    screen.queryByRole("button", {
                        name: "Saving...",
                    })
                ).not.toBeInTheDocument();
            });
        });
    });

    describe("closing modal", () => {
        it("should call onClose when Cancel is clicked", async () => {
            const user = userEvent.setup();

            const onClose = vi.fn();

            renderManageProjectCard(
                "create",
                undefined,
                vi.fn(),
                onClose
            );

            await user.click(
                screen.getByRole("button", {
                    name: "Cancel",
                })
            );

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("should call onClose when the close button is clicked", async () => {
            const user = userEvent.setup();

            const onClose = vi.fn();

            renderManageProjectCard(
                "create",
                undefined,
                vi.fn(),
                onClose
            );

            const closeButton = screen.getByRole(
                "button",
                { name: "Cancel" }
            );

            await user.click(closeButton);

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("should call onClose when the overlay is clicked", async () => {
            const user = userEvent.setup();

            const onClose = vi.fn();

            renderManageProjectCard(
                "create",
                undefined,
                vi.fn(),
                onClose
            );

            const overlay = document.querySelector(
                ".fixed.inset-0.z-40"
            );

            expect(overlay).toBeInTheDocument();

            await user.click(overlay!);

            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});