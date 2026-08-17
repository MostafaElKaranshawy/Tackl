import { useState } from "react";
import type TaskHistory from "../../types/taskHistory";
import {
    formatDate,
    formatFieldName,
    getActionStyles,
} from "../../utils/taskHistoryUtils";
import ChangeCard from "./ChangeCard";


export default function HistoryCard({ history }: { history: TaskHistory }) {
    const [expanded, setExpanded] = useState(false);
    const changes = history.taskChanges ?? [];

    return (
        <div
            className={`rounded-lg border overflow-hidden transition-colors hover:bg-gray-200 ${expanded
                ? "border-gray-300 bg-gray-100"
                : "border-gray-200 bg-white"
                }`}
        >
            <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                aria-expanded={expanded}
                className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-gray cursor-pointer transition-colors"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <span
                        className={`px-2.5 py-1 rounded-md border text-xs font-medium ${getActionStyles(
                            history.actionType
                        )}`}
                    >
                        {`${formatFieldName(history.fieldName)} ${history.actionType.charAt(0).toUpperCase() + history.actionType.slice(1)}`}
                    </span>

                    <span className="text-sm text-gray-500 truncate">
                        {formatDate(history.createdAt)}
                    </span>
                    {history.actionBy && (
                        <span className="text-sm text-gray-400 truncate">
                            by {history.actionBy.name}
                        </span>
                    )}
                </div>

                <svg
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""
                        }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {/* Details */}
            {expanded && (
                <div className="px-4 pb-3 border-t border-gray-100">
                    {changes.length > 0 ? (
                        changes.map((change) => (
                            <ChangeCard
                                key={change.id}
                                change={change}
                            />
                        ))
                    ) : (
                        <p className="py-4 text-sm text-gray-400">
                            No change details available.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}