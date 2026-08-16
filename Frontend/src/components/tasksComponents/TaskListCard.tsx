import type Task from "../../types/task";

export default function TaskListCard(
    { task, onClick }
        : { task: Task; onClick: () => void }) {

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md cursor-pointer"
            onClick={onClick}
        >
            <div className="mb-3 flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    {task.title}
                </h3>
                <div className="col flex flex-col items-end gap-2">
                    <div className="flex flex-col items-end gap-1">
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${task.status === "to do"
                                ? "bg-gray-100 text-gray-700"
                                : task.status === "in_progress"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                        >
                            {task.status === "to do"
                                ? "To do"
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

                <div className="flex items-center justify-between gap-2">
                    <div>
                        <p className="text-gray-500">Due Date</p>
                        <p className="mt-1 font-medium text-gray-800">
                            {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString()
                                : "N/A"}

                        </p>
                    </div>
                    {
                        task.status !== "done" && task.dueDate && new Date(task.dueDate) < new Date() && (
                            <div className="ml-2 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                                <span>
                                    Overdue
                                </span>
                            </div>
                        )
                    }
                </div>

                <div className="col-span-2">
                    <p className="text-gray-500">Estimated Time</p>
                    <p className="mt-1 font-medium text-gray-800">
                        {task.estimatedTime
                            ? `${task.estimatedTime} min${task.estimatedTime !== 1 ? "s" : ""
                            }`
                            : "N/A"}
                    </p>
                </div>
            </div>
        </div>
    );
}