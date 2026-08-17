import { useState } from "react";
import axios from "axios";
import { notify } from "../../utils/notify";
import { createProject, updateProject } from "../../services/projectService";
import type Project from "../../types/project";

interface ProjectFormModalProps {
    mode: "create" | "edit";
    project?: Project;
    onSuccess: (project?: Project) => void;
    onClose: () => void;
}

export default function ManageProjectCard({
    mode,
    project,
    onSuccess,
    onClose,
}: ProjectFormModalProps) {
    const [name, setName] = useState(mode === "edit" && project ? project.name : "");
    const [nameError, setNameError] = useState("");

    const [description, setDescription] = useState(mode === "edit" && project ? project.description ?? "" : "");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) {
            setNameError("Project name cannot be empty.");
            return;
        }

        setLoading(true);

        try {
            if (mode === "create") {
                const createdProject = await createProject({
                    name: name.trim(),
                    description: description.trim(),
                });
                onSuccess(createdProject);
                notify.success("Project created successfully!");
            } else {
                if (!project) {
                    notify.error("No project selected.");
                    return;
                }

                const updatedProject = await updateProject(project.id, {
                    name: name.trim(),
                    description: description.trim(),
                }) as Project;

                onSuccess(updatedProject);
                notify.success("Project updated successfully!");
            }

            onClose();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                switch (error.response?.status) {
                    case 400:
                        notify.error("Invalid project data.");
                        break;
                    case 401:
                        notify.error("You are not authorized.");
                        break;
                    case 404:
                        notify.error("Project not found.");
                        break;
                    default:
                        notify.error("Something went wrong. Please try again.");
                }
            } else {
                notify.error("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-blue-600">
                        {mode === "create"
                            ? "Create New Project"
                            : "Edit Project"}
                    </h2>

                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-3xl leading-none text-gray-400 transition hover:text-red-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        &times;
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Project Name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setNameError("");
                            }}
                            placeholder="Enter project name"
                            className={"w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 " + (nameError ? 'border-red-500' : '')}
                        />
                        {nameError && (
                            <p className="mt-1 text-sm text-red-500">{nameError}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 flex items-center gap-1">
                            <p>Description</p>
                            <p className="text-xs text-gray-500">(Optional)</p>
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your project..."
                            rows={6}
                            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? mode === "create"
                                    ? "Creating..."
                                    : "Saving..."
                                : mode === "create"
                                    ? "Create Project"
                                    : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}