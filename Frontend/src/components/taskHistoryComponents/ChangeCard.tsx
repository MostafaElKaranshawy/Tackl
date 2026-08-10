import type TaskChange from "../../types/taskChange";
import {
    formatFieldName,
    formatValue
} from "../../utils/taskHistoryUtils";

export default function ChangeCard({ change }: { change: TaskChange }) {
    const actionLabel =
        change.actionType.charAt(0).toUpperCase() +
        change.actionType.slice(1);

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            {/* Field name + action */}
            <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-800">
                    {formatFieldName(change.fieldName)}
                </p>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${change.actionType === "created"
                            ? "bg-green-500 text-white"
                            : change.actionType === "deleted"
                                ? "bg-red-500 text-white"
                                : "bg-blue-500 text-white"
                        }`}
                >
                    {actionLabel}
                </span>
            </div>

            {/* Values */}
            <div className="flex items-center gap-3 min-w-0">
                {change.actionType === "created" ? (
                    <div className="flex-1 min-w-0">
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-green-600">
                            New value
                        </p>

                        <div className="rounded-md border-2 border-green-400 bg-green-50 px-3 py-2 text-sm font-medium text-green-800 break-words">
                            {formatValue(change.newValue)}
                        </div>
                    </div>
                ) : change.actionType === "deleted" ? (
                    <div className="flex-1 min-w-0">
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-red-600">
                            Old value
                        </p>

                        <div className="rounded-md border-2 border-red-400 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 break-words">
                            {formatValue(change.oldValue)}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 min-w-0">
                            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-red-600">
                                Old value
                            </p>

                            <div className="rounded-md border-2 border-red-400 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 break-words">
                                {formatValue(change.oldValue)}
                            </div>
                        </div>

                        <span className="shrink-0 text-xl font-bold text-gray-500">
                            →
                        </span>

                        <div className="flex-1 min-w-0">
                            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-green-600">
                                New value
                            </p>

                            <div className="rounded-md border-2 border-green-400 bg-green-50 px-3 py-2 text-sm font-medium text-green-800 break-words">
                                {formatValue(change.newValue)}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}