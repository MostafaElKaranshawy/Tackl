import type Project from "../../../types/project";
import { GoProjectRoadmap } from "react-icons/go";
import { MdAccessTime, MdUpdate } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { useState } from "react";
import ManageProjectCard from "../ManageProjectCard";
import ConfirmationModal from "../../ConfirmationModal";
import { deleteProject } from "../../../services/projectService";
import { useCurrentProjectContext } from "../../../contexts/CurrentProjectContext";

export default function ProjectShow({ project, deleteRefresh }: { project: Project, deleteRefresh?: () => void }) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const { setProjectId } = useCurrentProjectContext();

    const handleDeleteProject = async (id: string) => {
        try {
            await deleteProject(id);
            setProjectId(null);
            deleteRefresh && deleteRefresh();
        } catch (error) {
            alert("Failed to delete project. Please try again later.");
        }
    }
    return (
        <section className="flex-1 rounded-xl border border-gray-200 bg-white p-8 shadow-md">
            <div className="mb-8 flex items-center gap-3 border-b border-gray-200 pb-5">
                <div className="rounded-lg bg-blue-100 p-3 flex items-center justify-center">
                    <GoProjectRoadmap className="text-3xl text-blue-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {project.name}
                    </h1>
                    <p className="text-sm text-gray-500">
                        Project Information
                    </p>
                </div>
                <div className="project-tools flex items-center gap-3 ml-auto text-2xl text-blue-500">
                    <FaEdit
                        className="text-gray-500 cursor-pointer hover:text-blue-700 transition ease duration-150"
                        onClick={() => {
                            setShowEditModal(true);
                        }}
                    />
                    <MdDeleteForever
                        className="text-gray-500 cursor-pointer hover:text-red-700 transition ease duration-150"
                        onClick={() => setShowDeleteConfirmation(true)}
                    />
                </div>
            </div>

            <div className="space-y-8 mb-8">
                <div>
                    <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                        Description
                    </h2>

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <p className="leading-7 text-gray-700">
                            {project.description || (
                                <span className="italic text-gray-400">
                                    No description provided.
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <MdAccessTime className="text-2xl text-green-600" />

                        <div>
                            <p className="text-xs uppercase text-gray-500">
                                Created
                            </p>
                            <p className="font-medium text-gray-800">
                                {new Date(project.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <MdUpdate className="text-2xl text-blue-600" />

                        <div>
                            <p className="text-xs uppercase text-gray-500">
                                Last Updated
                            </p>
                            <p className="font-medium text-gray-800">
                                {new Date(project.updatedAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <br />

            <div>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                        Tasks
                    </h2>

                    <button
                        disabled
                        className="rounded-md bg-blue-500 px-3 py-1 text-sm font-medium text-white opacity-50 cursor-not-allowed"
                    >
                        + Add Task
                    </button>
                </div>

                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8">
                    <div className="flex flex-col items-center justify-center text-center">
                        <p className="text-lg font-medium text-gray-600">
                            No tasks yet
                        </p>

                        <p className="mt-2 max-w-md text-sm text-gray-500">
                            Tasks for this project will appear here. You'll be able to
                            create, assign, prioritize, and track progress.
                        </p>
                    </div>
                </div>
            </div>
            {
                showEditModal && (
                    <ManageProjectCard
                        mode="edit"
                        project={project}
                        onSuccess={() => {
                            setShowEditModal(false);
                        }}
                        onClose={() => setShowEditModal(false)}
                    />
                )
            }
            {
                showDeleteConfirmation && (
                    <ConfirmationModal
                        title="Delete Project"
                        message={`Are you sure you want to delete the project "${project.name}"? This action cannot be undone and will delete all subsequent created tasks!`}
                        onConfirm={() => {
                            handleDeleteProject(project.id);
                            setShowDeleteConfirmation(false);
                        }}
                        onCancel={() => setShowDeleteConfirmation(false)}
                        danger={true}
                    />
                )
            }
        </section>
    );
}