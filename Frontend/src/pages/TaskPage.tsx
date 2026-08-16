import { useEffect, useState } from "react";
import { getTaskById } from "../services/taskService";
import { useParams } from "react-router-dom";
import { deleteTask } from "../services/taskService";

import type Task from "../types/task";
import ConfirmationModal from "../components/generalPurposeComponents/ConfirmationModal";
import ManageTaskCard from "../components/tasksComponents/ManageTaskCard";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaHistory } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { formatMinutes } from "../utils/timeFormater";
import TaskEntriesList from "../components/timeEntriesComponents/TimeEntriesList";
import { useTaskRefreshContext } from "../contexts/TaskRefreshContext/useTaskRefreshContext";
import { notify } from "../utils/notify";
import TaskHistoryList from "../components/taskHistoryComponents/TaskHistoryList";
import axios from "axios";

import type { Column } from "../types/column";
import { getBoardColumnsByProjectId } from '../services/boardColumnService';


export default function TaskPage() {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [totalLoggedTime, setTotalLoggedTime] = useState(0);
    const [showTaskHistory, setShowTaskHistory] = useState(false);
    const [boardColumns, setBoardColumns] = useState<Column[]>([]);
    const { key } = useTaskRefreshContext();
    const navigate = useNavigate();

    const { projectId, taskId } = useParams<{
        projectId: string;
        taskId: string;
    }>();

    const [task, setTask] = useState<Task | null>(null);

    useEffect(() => {
        if (!taskId || !projectId) return;

        let cancelled = false;

        const loadTask = async () => {
            try {
                const data = await getTaskById(taskId, projectId);
                if (!cancelled) {
                    setTask(data);
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    navigate("/login");
                }
                notify.error("Failed to fetch task.");
            }
        };

        loadTask();

        return () => {
            cancelled = true;
        };
    }, [projectId, taskId, key, navigate]);


    useEffect(() => {
        if (!projectId || projectId === "undefined") {
            return;
        }

        let cancelled = false;

        const loadBoardColumns = async () => {
            try {
                const data = await getBoardColumnsByProjectId(projectId);
                if (!cancelled) {
                    setBoardColumns(data);
                }
            } catch {
                if (!cancelled) {
                    notify.error("Failed to load board columns.");
                }
            }
        };

        loadBoardColumns();

        return () => {
            cancelled = true;
        };
    }, [projectId]);

    const handleDeleteTask = async () => {
        if (!taskId || !projectId) return;

        try {
            await deleteTask(taskId, projectId);

            navigate({ pathname: `/projects/${projectId}`, search: location.search.replace(/(\?|&)taskId=[^&]*/, '') });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                navigate("/login");
            }
            notify.error("Failed to delete task.");
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
            <div className="back-button">
                <button
                    onClick={() => {
                        navigate(-1);
                    }}
                    className="rounded-lg bg-white px-4 py-2 text-gray-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                >
                    Back
                </button>
            </div>
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
                                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-gray-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                            >
                                <FaEdit />
                                Edit
                            </button>

                            <button
                                onClick={() => setShowDeleteConfirmation(true)}
                                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-red-600 shadow-sm transition hover:bg-red-50 cursor-pointer"
                            >
                                <MdDeleteForever />
                                Delete
                            </button>

                            <button
                                onClick={() => setShowTaskHistory(!showTaskHistory)}
                                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-gray-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                            >
                                <FaHistory />
                                History
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

                            <div className="divide-y divide-gray-200">

                                <div className="flex justify-between py-3">
                                    <span className="text-gray-500">Status</span>
                                    <span className={"font-medium text-right" + (task.status === "todo"
                                        ? " text-gray-700"
                                        : task.status === "in_progress"
                                            ? " text-yellow-700"
                                            : " text-green-700")}>
                                        {
                                            task.columnId ? boardColumns.find(column => column.id === task.columnId)?.name
                                                :
                                                task.status === "todo"
                                                    ? "To Do"
                                                    : task.status === "in_progress"
                                                        ? "In Progress"
                                                        : "Done"
                                        }
                                    </span>
                                </div>

                                <div className="flex justify-between py-3">
                                    <span className="text-gray-500">Priority</span>
                                    <span className={"font-medium text-right" + (task.priority === "high"
                                        ? " text-red-700"
                                        : task.priority === "medium"
                                            ? " text-yellow-700"
                                            : " text-green-700")}>
                                        {task.priority}
                                    </span>
                                </div>
                                <div
                                    className={
                                        "group relative flex justify-between py-3"
                                        + (task.status !== "done" && task.dueDate && new Date(task.dueDate) < new Date() ? " bg-red-100" : "")
                                    }>
                                    <span
                                        className="text-gray-500">
                                        Overdue Date
                                    </span>
                                    <span className={"font-medium text-right"}>
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
                                    </span>
                                    {
                                        task.status !== "done" && task.dueDate && new Date(task.dueDate) < new Date() && (
                                            <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-red-500 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">
                                                Overdue
                                            </div>
                                        )
                                    }
                                </div>
                                <div
                                    className={
                                        "group relative flex justify-between py-3"
                                        + (task.estimatedTime && totalLoggedTime > 0 && totalLoggedTime > task.estimatedTime ? " bg-red-100" : "")
                                    }>
                                    <span className="text-gray-500">Estimated Time</span>
                                    <p className="font-medium text-gray-800">
                                        {task.estimatedTime
                                            ? formatMinutes(task.estimatedTime)
                                            : "N/A"}
                                    </p>
                                    {
                                        task.estimatedTime && totalLoggedTime > 0 && (
                                            <div className={"absolute w-[100px] bottom-full left-1/2 mb-2 -translate-x-1/2 rounded px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                + (totalLoggedTime > task.estimatedTime ? " bg-red-500" : " bg-gray-500")
                                            }>
                                                {totalLoggedTime > task.estimatedTime ? `Estimated Time Exceeded by ${formatMinutes(totalLoggedTime - task.estimatedTime)}` :
                                                    "Remaining Time: " + formatMinutes(task.estimatedTime - totalLoggedTime)}
                                            </div>
                                        )
                                    }
                                </div>
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
                <TaskEntriesList projectId={task.projectId} taskId={task.id} currentScreen="task-page" updateTotalTime={setTotalLoggedTime} />
            </div>
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
            {
                showTaskHistory && (
                    <TaskHistoryList
                        taskId={task.id}
                        projectId={task.projectId}
                        closeTaskHistoryList={() => setShowTaskHistory(false)}
                    />
                )
            }
        </div>
    );
}