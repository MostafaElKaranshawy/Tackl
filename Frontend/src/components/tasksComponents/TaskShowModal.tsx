import type Task from "../../types/task";
import { getTaskById } from "../../services/taskService";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { MdAccessTime, MdCalendarToday, MdDeleteForever, MdFlag, MdUpdate, MdOpenInNew } from "react-icons/md";
import ManageTaskCard from "./ManageTaskCard";
import ConfirmationModal from "../generalPurposeComponents/ConfirmationModal";
import { deleteTask } from "../../services/taskService";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTaskRefreshContext } from "../../contexts/TaskRefreshContext/useTaskRefreshContext";
import TimeEntriesList from "../timeEntriesComponents/TimeEntriesList";
import { formatMinutes } from "../../utils/timeFormater";
import { notify } from "../../utils/notify";

export default function TaskShow() {
    const [task, setTask] = useState<Task | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const navigate = useNavigate();
    const selectedTaskRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const taskId = searchParams.get("taskId") || "";
    const { projectId } = useParams<{ projectId: string }>();
    const [totalLoggedTime, setTotalLoggedTime] = useState(0);
    const { setKey } = useTaskRefreshContext();

    const closeTaskWindow = useCallback(() => {
        setTask(null);

        navigate({
            pathname: `/projects${projectId ? `/${projectId}` : ""}`,
            search: location.search.replace(/(\?|&)taskId=[^&]*/, ""),
        });
        setKey(prevKey => (prevKey + 1) % 2);
    }, [navigate, projectId, location.search]);

    useEffect(() => {
        if (!taskId || !projectId || projectId === "undefined") {
            return;
        }

        let cancelled = false;

        const loadTask = async () => {
            try {
                const data = await getTaskById(taskId, projectId);
                if (!cancelled) {
                    setTask(data);
                }
            } catch {
                if (!cancelled) {
                    closeTaskWindow();
                }
            }
        };

        loadTask();

        return () => {
            cancelled = true;
        };
    }, [taskId, projectId, closeTaskWindow]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                selectedTaskRef.current &&
                !selectedTaskRef.current.contains(event.target as Node)
            ) {
                closeTaskWindow();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [closeTaskWindow]);

    const handleDeleteTask = async () => {
        if (!taskId || !projectId || projectId === "undefined") {
            notify.error("Task ID or Project ID is missing.");
            return;
        }
        try {
            await deleteTask(taskId, projectId);
            refresh(true);
        } catch {
            notify.error("Failed to delete task.");
        }
    };
    const refresh = (close: boolean) => {
        if (close) {
            closeTaskWindow();
        }
        else {
            setKey(prevKey => (prevKey + 1) % 2);
        }
    }
    if (!task) {
        return <></>
    }

    const statusClasses =
        task.status === "to do"
            ? "bg-gray-100 text-gray-700"
            : task.status === "in progress"
                ? "bg-yellow-100 text-yellow-700"
                : task.status === "done" ?
                    "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700";

    const priorityClasses =
        task.priority === "high"
            ? "bg-red-100 text-red-700"
            : task.priority === "medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700";

    return (
        <div className="min-w-5xl fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="relative w-[80%] rounded-lg bg-white p-6 shadow-lg " ref={selectedTaskRef}>
                <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-md">
                    <div className="mb-8 flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {task.title}
                            </h1>

                            <span
                                className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusClasses}`}
                            >
                                {
                                    task.status.charAt(0).toUpperCase() + task.status.slice(1).replace("_", " ")
                                }
                            </span>
                        </div>

                        <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 shadow-sm">
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="rounded-full p-2 text-gray-500 transition hover:bg-blue-100 hover:text-blue-600 cursor-pointer"
                                title="Edit Task"
                            >
                                <FaEdit className="text-lg" />
                            </button>

                            <button
                                onClick={() => setShowDeleteConfirmation(true)}
                                className="rounded-full p-2 text-gray-500 transition hover:bg-red-100 hover:text-red-600 cursor-pointer"
                                title="Delete Task"
                            >
                                <MdDeleteForever className="text-xl" />
                            </button>

                            <button
                                title="Open Task in New Tab"
                                className="rounded-full p-2 text-gray-500 transition hover:bg-green-100 hover:text-green-600 cursor-pointer"
                                onClick={() => {
                                    navigate(`/projects/${task.projectId}/tasks/${task.id}`);
                                }}>
                                <MdOpenInNew
                                    className="text-lg text-gray-500 transition hover:text-blue-600"
                                />
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

                        <div
                            className={"group relative flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4" + (task.status !== "done" && task.dueDate && new Date(task.dueDate) < new Date() ? " border-red-200 bg-red-100" : "")}
                        >
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
                            {
                                task.status !== "done" && task.dueDate && new Date(task.dueDate) < new Date() && (
                                    <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-red-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                        Task overdue
                                    </div>
                                )
                            }
                        </div>

                        <div
                            className={
                                "group relative flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
                                + (task.estimatedTime && totalLoggedTime > task.estimatedTime ? " border-red-200 bg-red-100" : "")
                            }
                        >
                            <MdAccessTime className="text-2xl text-purple-600" />
                            {
                                task.estimatedTime && (
                                    <div className={
                                        "pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                                        + (totalLoggedTime > task.estimatedTime ? " bg-red-500" : " bg-gray-500")
                                    }>
                                        {totalLoggedTime > task.estimatedTime ? `Estimated Time Exceeded by ${formatMinutes(totalLoggedTime - task.estimatedTime)}` :
                                            "Remaining Time: " + formatMinutes(task.estimatedTime - totalLoggedTime)}
                                    </div>
                                )
                            }
                            <div>
                                <p className="text-xs uppercase text-gray-500">
                                    Estimated Time
                                </p>

                                <div className="inline-block">
                                    <p className="font-medium text-gray-800">
                                        {task.estimatedTime
                                            ? formatMinutes(task.estimatedTime)
                                            : "N/A"}
                                    </p>
                                </div>
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
                    <TimeEntriesList projectId={task.projectId} taskId={task.id} currentScreen="task-modal" updateTotalTime={setTotalLoggedTime} />
                    {showEditModal && (
                        <ManageTaskCard
                            mode="edit"
                            task={task}
                            projectId={task.projectId}
                            onClose={() => setShowEditModal(false)}
                            onSuccess={(updatedData) => {
                                if (updatedData) {
                                    setTask(updatedData);
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
            </div>
        </div >
    );
}