import { useState } from "react";
import axios from "axios";
import { notify } from "../../utils/notify";
import { createTask, updateTask } from "../../services/taskService";
import type Task from "../../types/task";
import type { CreateTaskDto, UpdateTaskDto } from "../../types/task";

interface TaskFormModalProps {
    mode: "create" | "edit";
    task?: Task;
    projectId: string;
    onSuccess: (data?: Task) => void;
    onClose: () => void;
}

export default function ManageTaskCard({
    mode,
    task,
    projectId,
    onSuccess,
    onClose,
}: TaskFormModalProps) {
    const [title, setTitle] = useState(mode === "edit" && task ? task.title : "");
    const [titleError, setTitleError] = useState("");

    const [description, setDescription] = useState(mode === "edit" && task ? task.description ?? "" : "");
    const [priority, setPriority] = useState<"low" | "medium" | "high">(task && mode === "edit" ? task.priority : "medium");
    const [status, setStatus] = useState<"todo" | "in_progress" | "done">(task && mode === "edit" ? task.status : "todo");
    const [dueDate, setDueDate] = useState<string | null>(task && mode === "edit" ? task.dueDate : null);
    const [estimatedTime, setEstimatedTime] = useState<number | null>(task && mode === "edit" ? task.estimatedTime : null);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim()) {
            setTitleError("Task title cannot be empty.");
            return;
        }

        setLoading(true);

        try {
            if (mode === "create") {
                const taskData: CreateTaskDto = {
                    title: title.trim(),
                    description: description.trim() || null,
                    status: status,
                    priority: priority,
                    dueDate: dueDate,
                    estimatedTime: estimatedTime,
                };

                const createdTaskData = await createTask(taskData, projectId) as { task: Task, taskHistories: TaskHistory[] };
                onSuccess(createdTaskData.task);
                notify.success("Task created successfully!");
            } else {
                if (!task) {
                    notify.error("No task selected.");
                    return;
                }
                const updatedTaskData: UpdateTaskDto = {
                    title: title.trim(),
                    description: description.trim() || null,
                    status: status,
                    priority: priority,
                    dueDate: dueDate,
                    estimatedTime: estimatedTime,
                };
                const data = await updateTask(task.id, updatedTaskData, task.projectId) as { task: Task, taskHistories: TaskHistory[] };
                onSuccess(data.task);
                notify.success("Task updated successfully!");
            }

            onClose();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                switch (error.response?.status) {
                    case 400:
                        notify.error("Invalid task data.");
                        break;
                    case 401:
                        notify.error("You are not authorized to add tasks to this project.");
                        break;
                    case 404:
                        notify.error("Task not found.");
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
                            ? "Create New Task"
                            : "Edit Task"}
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
                            Task Title
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setTitleError("");
                            }}
                            placeholder="Enter task title"
                            className={"w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 " + (titleError ? 'border-red-500' : '')}
                        />
                        {titleError && (
                            <p className="mt-1 text-sm text-red-500">{titleError}</p>
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
                            placeholder="Describe your task..."
                            rows={6}
                            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Priority
                            </label>

                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Status
                            </label>

                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as "todo" | "in_progress" | "done")}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
                            >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 flex items-center gap-1">
                                <p>Due Date</p>
                                <p className="text-xs text-gray-500">(Optional)</p>
                            </label>

                            <input
                                type="date"
                                value={dueDate ? dueDate.split("T")[0] : ""}
                                onChange={(e) => setDueDate(e.target.value || null)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 flex items-center gap-1">
                                <p>Estimated Time</p>
                                <p className="text-xs text-gray-500">(Optional)</p>
                            </label>

                            <input
                                type="number"
                                min={0}
                                placeholder="Time in minutes"
                                value={estimatedTime ?? ""}
                                onChange={(e) => setEstimatedTime(e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
                            />
                        </div>
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
                                    ? "Create Task"
                                    : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}