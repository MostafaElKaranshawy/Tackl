import { useEffect, useRef, useState } from "react";
import type Task from "../../../types/task";
import { getAllProjectTasks } from "../../../services/taskService";
import TaskBoardCard from "./TaskBoardCard";
import { updateTask } from "../../../services/taskService";
import type { UpdateTaskDto } from "../../../types/task";
import TaskShow from "../../tasksComponents/TaskShow";

export default function TaskBoard({
    projectId,
    tasks,
    fetchTasks,
}: {
    projectId: string;
    tasks: Task[];
    fetchTasks: () => void;
}) {
    // const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const selectedTaskRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                selectedTaskRef.current &&
                !selectedTaskRef.current.contains(event.target as Node)
            ) {
                setSelectedTask(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [selectedTaskRef]);
    useEffect(() => {
        fetchTasks();
    }, [projectId]);

    // const handleTaskStatusChange = async (taskId: string, newStatus: "todo" | "in_progress" | "done") => {
    //     try {
    //         let taskToUpdate = tasks.find((task) => task.id === taskId);
    //         if (!taskToUpdate) {
    //             console.error("Task not found:", taskId);
    //             return;
    //         }
    //         let updatedTask: UpdateTaskDto = { ...taskToUpdate, status: newStatus };
    //         await updateTask(taskId, updatedTask, projectId);
    //         await fetchTasks();
    //     } catch (error) {
    //         console.error("Failed to update task status:", error);
    //     }
    // }

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
                                    onClick={() => setSelectedTask(task)}
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
            {
                selectedTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                        <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg" ref={selectedTaskRef}>
                            <TaskShow taskId={selectedTask.id} projectId={selectedTask.projectId}
                                refresh={async (close) => {
                                    await fetchTasks();
                                    if (close) {
                                        setSelectedTask(null);
                                    }
                                }} />
                        </div>
                    </div>
                )
            }
        </div>
    );
}