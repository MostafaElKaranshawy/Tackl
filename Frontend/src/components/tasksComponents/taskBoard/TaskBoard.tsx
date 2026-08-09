import { useEffect } from "react";
import type Task from "../../../types/task";
import TaskBoardCard from "./TaskBoardCard";
import { useLocation, useNavigate } from "react-router-dom";
import { useTaskRefreshContext } from "../../../contexts/TaskRefreshContext";

export default function TaskBoard({
    projectId,
    tasks,
    fetchTasks }: { projectId: string; tasks: Task[]; fetchTasks: () => void; }) {

    const navigate = useNavigate();
    const location = useLocation();
    const { key } = useTaskRefreshContext();

    useEffect(() => {
        fetchTasks();
    }, [projectId, key]);

    const handleTaskClick = (taskId: string) => {
        navigate(`${location.pathname}?taskId=${taskId}`, { state: { backgroundLocation: location } });
    }
    const todoTasks = tasks.filter((task) => task.status === "todo");
    const inProgressTasks = tasks.filter(
        (task) => task.status === "in_progress"
    );
    const doneTasks = tasks.filter((task) => task.status === "done");

    const columns = [
        {
            key: "todo",
            title: "To Do",
            tasks: todoTasks,
        },
        {
            key: "in_progress",
            title: "In Progress",
            tasks: inProgressTasks,
        },
        {
            key: "done",
            title: "Done",
            tasks: doneTasks,
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
            {columns.map((column) => (
                <div
                    key={column.key}
                    className="rounded-xl border border-gray-200 bg-gray-50 shadow-sm"
                >
                    <div className="border-b border-gray-200 px-5 py-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {column.title}
                            </h2>

                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                {column.tasks.length}
                            </span>
                        </div>
                    </div>

                    <div className="flex min-h-[300px] flex-col gap-3 p-4  overflow-y-scroll max-h-[300px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {column.tasks.length > 0 ? (
                            column.tasks.map((task) => (
                                <TaskBoardCard
                                    key={task.id}
                                    task={task}
                                    onClick={() => {
                                        handleTaskClick(task.id);
                                    }}
                                />
                            ))
                        ) : (
                            <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white text-sm text-gray-400">
                                No tasks
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}