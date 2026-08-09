import { useCallback, useEffect, useState } from "react";
import { getTaskById } from "../services/taskService";
import { useParams } from "react-router-dom";
import { deleteTask } from "../services/taskService";

import type Task from "../types/task";
import ConfirmationModal from "../components/ConfirmationModal";
import ManageTaskCard from "../components/tasksComponents/ManageTaskCard";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

export default function TaskPage() {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const navigate = useNavigate();

    const { projectId, taskId } = useParams<{
        projectId: string;
        taskId: string;
    }>();

    const [task, setTask] = useState<Task | null>(null);

    const fetchTask = useCallback(async () => {
        if (!taskId || !projectId) return;

        try {
            const data = await getTaskById(taskId, projectId);
            setTask(data);
        } catch (error) {
            console.error("Failed to fetch task.", error);
        }
    }, [projectId, taskId]);

    useEffect(() => {
        fetchTask();
    }, [fetchTask]);

    const handleDeleteTask = async () => {
        if (!taskId || !projectId) return;

        try {
            await deleteTask(taskId, projectId);

            navigate(`/projects/${projectId}`);
        } catch (error) {
            console.error("Failed to delete task.", error);
        }
    };

    if (!task) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white rounded-xl shadow-lg px-8 py-6">
                    <p className="text-lg text-gray-600">
                        Task not found.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full min-w-full bg-gray-100 p-8">
            <div className="bg-gray-100 py-8">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                                Task
                            </span>

                            <h1 className="mt-3 text-4xl font-bold text-gray-900">
                                {task.title}
                            </h1>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-gray-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                            >
                                <FaEdit />
                                Edit
                            </button>

                            <button
                                onClick={() => setShowDeleteConfirmation(true)}
                                className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-red-600 shadow-sm transition hover:bg-red-50 cursor-pointer"
                            >
                                <MdDeleteForever />
                                Delete
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
                        <div className="space-y-8">
                            <section className="rounded-xl bg-white p-6 shadow">
                                <h2 className="mb-4 text-xl font-semibold">
                                    Description
                                </h2>

                                <div className="rounded-lg border border-gray-300 bg-gray-50 p-5 min-h-60">
                                    {task.description ? (
                                        <p className="whitespace-pre-wrap leading-8 text-gray-700">
                                            {task.description}
                                        </p>
                                    ) : (
                                        <p className="italic text-gray-400">
                                            No description provided.
                                        </p>
                                    )}
                                </div>
                            </section>
                        </div>

                        <aside className="h-fit rounded-xl bg-white p-6 shadow">
                            <h2 className="mb-5 text-lg font-semibold">
                                Details
                            </h2>

                            <div className="divide-y">

                                <div className="flex justify-between py-3">
                                    <span className="text-gray-500">Created</span>
                                    <span className="font-medium text-right">
                                        {new Date(task.createdAt).toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex justify-between py-3">
                                    <span className="text-gray-500">Updated</span>
                                    <span className="font-medium text-right">
                                        {new Date(task.updatedAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
            {showEditModal && (
                <ManageTaskCard
                    mode="edit"
                    task={task}
                    projectId={task.projectId}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={(updatedTask) => {
                        if (updatedTask) {
                            setTask(updatedTask);
                        }

                        setShowEditModal(false);
                    }}
                />
            )}

            {showDeleteConfirmation && (
                <ConfirmationModal
                    title="Delete Task"
                    message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
                    onConfirm={async () => {
                        await handleDeleteTask();
                        setShowDeleteConfirmation(false);
                    }}
                    onCancel={() => setShowDeleteConfirmation(false)}
                    danger
                />
            )}
        </div>
    );
}