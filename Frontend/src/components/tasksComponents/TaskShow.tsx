import type Task from "../../types/task";
import { getTaskById } from "../../services/taskService";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { MdAccessTime, MdCalendarToday, MdDeleteForever, MdFlag, MdUpdate } from "react-icons/md";
import ManageTaskCard from "./ManageTaskCard";
import ConfirmationModal from "../ConfirmationModal";
import { deleteTask } from "../../services/taskService";

export default function TaskShow({ taskId, projectId, refresh }: { taskId: string; projectId: string; refresh: (close: boolean) => void }) {
    const [task, setTask] = useState<Task | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    useEffect(() => {
        fetchTask();
    }, [taskId]);

    const fetchTask = async () => {
        try {
            const task = await getTaskById(taskId, projectId);
            setTask(task);
        } catch (error) {
            console.error("Failed to fetch task:", error);
        }
    };
    const handleDeleteTask = async () => {
        try {
            await deleteTask(taskId, projectId);
            refresh(true);
        } catch (error) {
            console.error("Failed to delete task:", error);
        }
    };

    if (!task) {
        return <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">Task not found</div>;
    }

    const statusClasses =
        task.status === "todo"
            ? "bg-gray-100 text-gray-700"
            : task.status === "in_progress"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-green-100 text-green-700";

    const priorityClasses =
        task.priority === "high"
            ? "bg-red-100 text-red-700"
            : task.priority === "medium"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-green-100 text-green-700";

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-md">
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {task.title}
                    </h1>

                    <span
                        className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusClasses}`}
                    >
                        {task.status === "todo"
                            ? "To Do"
                            : task.status === "in_progress"
                            ? "In Progress"
                            : "Done"}
                    </span>
                </div>

                <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 shadow-sm">
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="rounded-full p-2 text-gray-500 transition hover:bg-blue-100 hover:text-blue-600"
                        title="Edit Task"
                    >
                        <FaEdit className="text-lg" />
                    </button>

                    <button
                        onClick={() => setShowDeleteConfirmation(true)}
                        className="rounded-full p-2 text-gray-500 transition hover:bg-red-100 hover:text-red-600"
                        title="Delete Task"
                    >
                        <MdDeleteForever className="text-xl" />
                    </button>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="mb-2 text-lg font-semibold uppercase tracking-wide text-gray-500">
                    Description
                </h2>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="leading-7 text-gray-700">
                        {task.description ? (
                            task.description
                        ) : (
                            <span className="italic text-gray-400">
                                No description provided.
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <MdFlag className="text-2xl text-orange-500" />

                    <div>
                        <p className="text-xs uppercase text-gray-500">
                            Priority
                        </p>

                        <span
                            className={`mt-1 inline-block rounded-md px-2 py-1 text-sm font-medium ${priorityClasses}`}
                        >
                            {task.priority}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <MdCalendarToday className="text-2xl text-blue-600" />

                    <div>
                        <p className="text-xs uppercase text-gray-500">
                            Due Date
                        </p>

                        <p className="font-medium text-gray-800">
                            {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString()
                                : "N/A"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <MdAccessTime className="text-2xl text-purple-600" />

                    <div>
                        <p className="text-xs uppercase text-gray-500">
                            Estimated Time
                        </p>

                        <p className="font-medium text-gray-800">
                            {task.estimatedTime
                                ? `${task.estimatedTime} hour${
                                      task.estimatedTime !== 1 ? "s" : ""
                                  }`
                                : "N/A"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <MdAccessTime className="text-2xl text-green-600" />

                    <div>
                        <p className="text-xs uppercase text-gray-500">
                            Created
                        </p>

                        <p className="font-medium text-gray-800">
                            {new Date(task.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="md:col-span-2 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <MdUpdate className="text-2xl text-indigo-600" />

                    <div>
                        <p className="text-xs uppercase text-gray-500">
                            Last Updated
                        </p>

                        <p className="font-medium text-gray-800">
                            {new Date(task.updatedAt).toLocaleString()}
                        </p>
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
                        refresh(false);
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