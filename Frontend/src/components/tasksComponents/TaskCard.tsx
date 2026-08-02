import { useState } from "react";
import type Task from "../../types/task";
import { FaEdit } from "react-icons/fa";
import ManageTaskCard from "./ManageTaskCard";
import { MdDeleteForever } from "react-icons/md";
import ConfirmationModal from "../ConfirmationModal";
import { deleteTask } from "../../services/taskService";
import { notify } from "../../utils/notify";

export default function TaskCard(
    { task, refresh }
    : { task: Task; refresh: () => void }){
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    
    const handleDeleteTask = async () => {
        try {
            await deleteTask(task.id, task.projectId);
            notify.success("Task deleted successfully!");
            refresh();
        } catch (error) {
            notify.error("Failed to delete task: " + (error as Error).message);
        }
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-3 flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    {task.title}
                </h3>
                <div className="col flex flex-col items-end gap-2">
                    <div className="task-tools flex text-2xl gap-3">
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
                    <div className="flex flex-col items-end gap-1">
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${task.status === "todo"
                                ? "bg-gray-100 text-gray-700"
                                : task.status === "in_progress"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                        >
                            {task.status === "todo"
                                ? "To Do"
                                : task.status === "in_progress"
                                    ? "In Progress"
                                    : "Done"}
                        </span>
                    </div>
                </div>

            </div>

            <p className="mb-5 text-sm leading-6 text-gray-600">
                {task.description || "No description provided."}
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-gray-500">Priority</p>
                    <span className={"mt-1 inline-block rounded-md bg-orange-100 px-2 py-1 font-medium text-orange-700" + (task.priority === "high" ? " bg-red-100 text-red-700" : task.priority === "medium" ? " bg-yellow-100 text-yellow-700" : " bg-green-100 text-green-700")}>
                        {task.priority}
                    </span>
                </div>

                <div>
                    <p className="text-gray-500">Due Date</p>
                    <p className="mt-1 font-medium text-gray-800">
                        {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : "N/A"}
                    </p>
                </div>

                <div className="col-span-2">
                    <p className="text-gray-500">Estimated Time</p>
                    <p className="mt-1 font-medium text-gray-800">
                        {task.estimatedTime
                            ? `${task.estimatedTime} hour${task.estimatedTime !== 1 ? "s" : ""
                            }`
                            : "N/A"}
                    </p>
                </div>
            </div>
            {
                showEditModal && (
                    <ManageTaskCard
                        mode="edit"
                        task={task}
                        projectId={task.projectId}
                        onClose={() => setShowEditModal(false)}
                        onSuccess={() => {
                            setShowEditModal(false);
                            refresh();
                        }}
                    />
                )

            }
            {
                showDeleteConfirmation && (
                    <ConfirmationModal
                        title="Delete Task"
                        message={`Are you sure you want to delete the task "${task.title}"? This action cannot be undone.`}
                        onConfirm={async () => {
                            await handleDeleteTask();
                            setShowDeleteConfirmation(false);
                        }}
                        onCancel={() => setShowDeleteConfirmation(false)}
                    />
                )

            }
        </div>
    );
}