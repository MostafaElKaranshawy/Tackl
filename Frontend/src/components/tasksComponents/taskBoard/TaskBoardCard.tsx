import { MdCalendarToday, MdFlag } from "react-icons/md";
import type Task from "../../../types/task";

interface TaskBoardCardProps {
    task: Task;
    onClick: () => void;
}

export default function TaskBoardCard({
    task,
    onClick
}: TaskBoardCardProps) {
    const priorityColors = {
        low: "bg-green-100 text-green-700",
        medium: "bg-yellow-100 text-yellow-700",
        high: "bg-red-100 text-red-700",
    };

    return (
        <div className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => onClick()}
        >
            <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-gray-800 line-clamp-2">
                    {task.title}
                </h3>

                <div
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${priorityColors[task.priority]
                        }`}
                >
                    <MdFlag />
                    {task.priority}
                </div>
            </div>

            {task.description && (
                <p className="mt-2 line-clamp-3 text-sm text-gray-500">
                    {task.description}
                </p>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="left-side flex items-center gap-1">

                    <MdCalendarToday className="text-base" />
                    {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "No due date"}
                </div>

                {
                    task.dueDate && new Date(task.dueDate) < new Date() && (
                        <div className="ml-2 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                            <span>
                                Overdue
                            </span>
                        </div>
                    )
                }
            </div>
        </div>
    );
}