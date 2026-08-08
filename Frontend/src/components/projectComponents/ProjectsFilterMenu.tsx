import { useState } from "react";

export default function ProjectsFilterMenu({
    onConfirm,
    filter,
    setFilter
}: {
    onConfirm: () => void;
    filter: { status: string; priority: string; overdue: boolean | false };
    setFilter: React.Dispatch<React.SetStateAction<{ status: string; priority: string; overdue: boolean | false }>>;
}) {
    const [statusFilter, setStatusFilter] = useState(filter.status || "");
    const [priorityFilter, setPriorityFilter] = useState(filter.priority || "");
    const [overdueFilter, setOverdueFilter] = useState(filter.overdue || false);

    return (
        <div className="mt-2 w-80 rounded-xl border border-gray-200 bg-white p-5 shadow-xl z-50">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Filters
            </h3>

            <div className="space-y-4">
                {/* Status */}
                <div>
                    <label
                        htmlFor="status"
                        className="mb-1 block text-sm font-medium text-gray-700 cursor-pointer"
                    >
                        Status
                    </label>

                    <select
                        id="status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                        <option value="">All</option>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                </div>

                {/* Priority */}
                <div>
                    <label
                        htmlFor="priority"
                        className="mb-1 block text-sm font-medium text-gray-700 cursor-pointer"
                    >
                        Priority
                    </label>

                    <select
                        id="priority"
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                        <option value="">All</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                {/* Overdue */}
                <label
                    htmlFor="overdue"
                    className="text-sm font-medium text-gray-700 cursor-pointer flex items-center justify-between rounded-lg border border-gray-200 p-3"
                >
                    Show only overdue
                    <input
                        id="overdue"
                        type="checkbox"
                        checked={overdueFilter}
                        onChange={(e) => setOverdueFilter(e.target.checked)}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                </label>


                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-2">
                    <button
                        onClick={() => {
                            setStatusFilter("");
                            setPriorityFilter("");
                            setOverdueFilter(false);
                            setFilter({ status: "", priority: "", overdue: "false" });
                        }}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
                    >
                        Reset
                    </button>

                    <button
                        onClick={() => {
                            setFilter({
                                status: statusFilter,
                                priority: priorityFilter,
                                overdue: overdueFilter,
                            });
                            onConfirm();
                        }}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 cursor-pointer"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div >
    );
}