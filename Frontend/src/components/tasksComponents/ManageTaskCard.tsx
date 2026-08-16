import { useEffect, useState } from "react";
import axios from "axios";
import { notify } from "../../utils/notify";
import { createTask, updateTask } from "../../services/taskService";
import type Task from "../../types/task";
import type { CreateTaskDto, UpdateTaskDto } from "../../types/task";
import { getProjectTaskStatusByProjectId } from "../../services/taskStatusService";
import type { Column } from "../../types/column";

interface TaskFormModalProps {
    mode: "create" | "edit";
    task?: Task;
    projectId: string;
    onSuccess: (data?: Task) => void;
    onClose: () => void;
}

export default function ManageTaskCard({ mode, task, projectId, onSuccess, onClose, }: TaskFormModalProps) {
    const [title, setTitle] = useState(mode === "edit" && task ? task.title : "");

    const [titleError, setTitleError] = useState("");

    const [taskStatuses, setTaskStatuses] = useState<Column[]>([]);

    const [description, setDescription] = useState(mode === "edit" && task ? task.description ?? "" : "");

    const [priority, setPriority] = useState<"low" | "medium" | "high">(task && mode === "edit" ? task.priority : "medium");

    const [status, setStatus] = useState<string>(task && mode === "edit" ? task.status : "");

    const [dueDate, setDueDate] = useState<string | null>(task && mode === "edit" ? task.dueDate : null);

    const [estimatedTime, setEstimatedTime] =
        useState<number | null>(
            task && mode === "edit"
                ? task.estimatedTime
                : null
        );

    const [loading, setLoading] = useState(false);
    const [columnsLoading, setColumnsLoading] =
        useState(true);

    useEffect(() => {
        let count = 0;
        const fetchTaskStatuses = async () => {
            try {
                setColumnsLoading(true);

                const taskStatuses =
                    await getProjectTaskStatusByProjectId(
                        projectId
                    );

                setTaskStatuses(taskStatuses);
                setStatus(
                    taskStatuses.length > 0
                        ? taskStatuses[0].status
                        : ""
                );
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 404) {
                        notify.error(
                            "Task statuses not found"
                        );
                    } else if (error.response?.status === 401) {
                        notify.error(
                            "Unauthorized access"
                        );
                    } else {
                        if (count < 3) {
                            count++;
                            fetchTaskStatuses();
                        } else {
                            notify.error(
                                "Error fetching task statuses"
                            );
                        }
                    }
                } else {
                    if (count < 3) {
                        count++;
                        fetchTaskStatuses();
                    } else {
                        notify.error(
                            "Error fetching task statuses"
                        );
                    }
                }
            } finally {
                setColumnsLoading(false);
            }
        };

        fetchTaskStatuses();
    }, [projectId]);

    const handleColumnChange = (selectedColumnStatus: string) => {
        const selectedColumn = taskStatuses.find(
            (status) =>
                status.status === selectedColumnStatus
        );

        if (!selectedColumn) return;

        setStatus(selectedColumn.status);
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            setTitleError("Task title cannot be empty.");
            return;
        }

        if (!status.trim()) {
            notify.error("Task status is required.");
            return;
        }

        setLoading(true);

        try {
            if (mode === "create") {
                const taskData: CreateTaskDto = {
                    title: title.trim(),
                    description:
                        description.trim() || null,
                    status: status.toLowerCase(),
                    priority,
                    dueDate,
                    estimatedTime,
                };

                const createdTaskData =
                    (await createTask(
                        taskData,
                        projectId
                    )) as Task;

                onSuccess(createdTaskData);

                notify.success(
                    "Task created successfully!"
                );
            } else {
                if (!task) {
                    notify.error(
                        "No task selected."
                    );
                    return;
                }

                const updatedTaskData: UpdateTaskDto = {
                    title: title.trim(),
                    description:
                        description.trim() || null,
                    status: status.toLowerCase(),
                    priority,
                    dueDate,
                    estimatedTime,
                };

                const data =
                    (await updateTask(
                        task.id,
                        updatedTaskData,
                        task.projectId
                    )) as Task;

                onSuccess(data);

                notify.success(
                    "Task updated successfully!"
                );
            }

            onClose();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                switch (error.response?.status) {
                    case 400:
                        notify.error(
                            "Invalid task data."
                        );
                        break;

                    case 401:
                        notify.error(
                            "You are not authorized to add tasks to this project."
                        );
                        break;

                    case 404:
                        notify.error(
                            "Task not found."
                        );
                        break;

                    default:
                        notify.error(
                            "Something went wrong. Please try again."
                        );
                }
            } else {
                notify.error(
                    "Something went wrong. Please try again."
                );
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
                        className="cursor-pointer text-3xl leading-none text-gray-400 transition hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
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
                                setTitle(
                                    e.target.value
                                );
                                setTitleError("");
                            }}
                            placeholder="Enter task title"
                            className={
                                "w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 " +
                                (titleError
                                    ? "border-red-500"
                                    : "")
                            }
                        />

                        {titleError && (
                            <p className="mt-1 text-sm text-red-500">
                                {titleError}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                            <p>Description</p>
                            <p className="text-xs text-gray-500">
                                (Optional)
                            </p>
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(
                                    e.target.value
                                )
                            }
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
                                onChange={(e) =>
                                    setPriority(
                                        e.target
                                            .value as
                                        | "low"
                                        | "medium"
                                        | "high"
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
                            >
                                <option value="low">
                                    Low
                                </option>

                                <option value="medium">
                                    Medium
                                </option>

                                <option value="high">
                                    High
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Status
                            </label>

                            <select
                                value={
                                    status
                                }
                                onChange={(e) =>
                                    handleColumnChange(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    columnsLoading
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 disabled:bg-gray-100"
                            >
                                {columnsLoading ? (
                                    <option>
                                        Loading...
                                    </option>
                                ) : (
                                    taskStatuses.map(
                                        (status) => (
                                            <option
                                                key={
                                                    status.status
                                                }
                                                value={
                                                    status.status
                                                }
                                            >
                                                {
                                                    status.status.substring(0, 1).toUpperCase() +
                                                    status.status.substring(1).replace(/_/g, " ")
                                                }
                                            </option>
                                        )
                                    )
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                                <p>Due Date</p>
                                <p className="text-xs text-gray-500">
                                    (Optional)
                                </p>
                            </label>

                            <input
                                type="date"
                                value={
                                    dueDate
                                        ? dueDate.split(
                                            "T"
                                        )[0]
                                        : ""
                                }
                                onChange={(e) =>
                                    setDueDate(
                                        e.target.value ||
                                        null
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                                <p>
                                    Estimated Time
                                </p>
                                <p className="text-xs text-gray-500">
                                    (Optional)
                                </p>
                            </label>

                            <input
                                type="number"
                                min={0}
                                placeholder="Time in minutes"
                                value={
                                    estimatedTime ??
                                    ""
                                }
                                onChange={(e) =>
                                    setEstimatedTime(
                                        e.target.value
                                            ? parseInt(
                                                e
                                                    .target
                                                    .value
                                            )
                                            : null
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={
                                loading ||
                                columnsLoading
                            }
                            className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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