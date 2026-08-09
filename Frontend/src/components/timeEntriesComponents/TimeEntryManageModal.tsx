import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import {
    createTimeEntry,
    deleteTimeEntry,
    updateTimeEntry,
} from "../../services/timeEntriesService";
import type TimeEntry from "../../types/timeEntry";
import { notify } from "../../utils/notify";
import ConfirmationModal from "../generalPurposeComponents/ConfirmationModal";

type Props = {
    projectId: string;
    taskId: string;
    timeEntry?: TimeEntry;
    onClose: () => void;
    onUpdate: () => void;
};

export default function TimeEntryManageModal({ projectId, taskId, timeEntry, onClose, onUpdate, }: Props) {
    const [entry, setEntry] = useState<TimeEntry | undefined>(timeEntry);
    const [mode, setMode] = useState<"show" | "edit" | "create">(
        timeEntry ? "show" : "create"
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const [duration, setDuration] = useState(entry?.duration ?? 0);
    const [date, setDate] = useState(
        entry
            ? new Date(entry.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0]
    );
    const [dateError, setDateError] = useState<string | null>(null);
    const [durationError, setDurationError] = useState<string | null>(null);

    const [note, setNote] = useState(entry?.note ?? "");

    const readOnly = mode === "show";

    const handleSubmit = async () => {
        if (!duration || !date) {
            setDateError(!date ? "Date is required." : date > new Date().toISOString().split("T")[0] ? "Date cannot be in the future." : null);
            setDurationError(!duration ? "Duration is required." : null);
            notify.error("Duration and date are required.");
            return;
        }
        if (date > new Date().toISOString().split("T")[0]) {
            setDateError("Date cannot be in the future.");
            notify.error("Date cannot be in the future.");
            return;
        }
        try {
            setIsSubmitting(true);

            if (mode === "create") {
                const created = await createTimeEntry(projectId, taskId, {
                    duration,
                    date,
                    note,
                });

                setEntry(created);
                setMode("show");
            } else if (entry) {
                const updated = await updateTimeEntry(projectId, taskId, entry.id, {
                    duration,
                    date,
                    note,
                });

                setEntry(updated);
                setMode("show");
            }

            onUpdate();
        } catch {
            notify.error("Failed to save time entry.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!entry) return;

        try {
            setIsSubmitting(true);

            await deleteTimeEntry(projectId, taskId, entry.id);

            notify.success("Time entry deleted.");

            onUpdate();
            onClose();
        } catch {
            notify.error("Failed to delete time entry.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {mode === "create"
                            ? "Create Time Entry"
                            : mode === "edit"
                                ? "Edit Time Entry"
                                : "Time Entry"}
                    </h2>

                    {mode === "show" && (
                        <div className="flex items-center gap-2 text-2xl">
                            <button
                                onClick={() => setMode("edit")}
                                className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 cursor-pointer"
                            >
                                <FaEdit />
                            </button>

                            <button
                                onClick={() => setShowDeleteConfirmation(true)}
                                disabled={isSubmitting}
                                className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                            >
                                <MdDeleteForever />
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-4 p-6">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Duration (minutes)
                        </label>

                        <input
                            type="number"
                            min={1}
                            disabled={readOnly}
                            value={duration}
                            onChange={(e) => {
                                setDurationError(null);
                                setDuration(Number(e.target.value))
                            }}
                            className={
                                "w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                + (durationError ? " border-red-500" : "")
                            }
                        />
                        {durationError && (
                            <p className="text-sm text-red-600">{durationError}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Date
                        </label>

                        <input
                            type="date"
                            disabled={readOnly}
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value)
                                setDateError(null);
                            }}
                            className={
                                "w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                + (dateError ? " border-red-500" : "")
                            }
                        />
                        {dateError && (
                            <p className="text-sm text-red-600">{dateError}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 flex items-center gap-1">
                            <p>Note</p>
                            {
                                mode !== "show" && (
                                    <p className="text-xs text-gray-500">(Optional)</p>
                                )
                            }
                        </label>

                        <textarea
                            rows={4}
                            disabled={readOnly}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add a note..."
                            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
                    <button
                        onClick={() => {
                            if (mode === "edit") {
                                setDuration(entry?.duration ?? 0);
                                setDate(
                                    entry
                                        ? new Date(entry.date)
                                            .toISOString()
                                            .split("T")[0]
                                        : new Date()
                                            .toISOString()
                                            .split("T")[0]
                                );
                                setNote(entry?.note ?? "");
                                setMode("show");
                            } else {
                                onClose();
                            }
                        }}
                        disabled={isSubmitting}
                        className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-300 cursor-pointer"
                    >
                        {mode === "edit" ? "Discard" : "Close"}
                    </button>

                    {mode !== "show" && (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting
                                ? "Saving..."
                                : mode === "create"
                                    ? "Create"
                                    : "Save Changes"}
                        </button>
                    )}
                </div>
            </div>
            {
                showDeleteConfirmation && (
                    <ConfirmationModal
                        title="Delete Time Entry"
                        message="Are you sure you want to delete this time entry? This action cannot be undone."
                        onConfirm={handleDelete}
                        danger={true}
                        onCancel={() => setShowDeleteConfirmation(false)}
                    />
                )
            }
        </div>
    );
}