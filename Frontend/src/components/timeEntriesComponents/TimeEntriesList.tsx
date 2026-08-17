import { useEffect, useState } from "react";
import { getTaskTimeEntries } from "../../services/timeEntriesService";
import type TimeEntry from "../../types/timeEntry";
import TimeEntryListCard from "./TimeEntryListCard";
import { formatMinutes } from "../../utils/timeFormater";
import TimeEntryManageModal from "./TimeEntryManageModal";
import { useTaskRefreshContext } from "../../contexts/TaskRefreshContext/useTaskRefreshContext";
import { notify } from "../../utils/notify";

export default function TimeEntriesList({ projectId, taskId, currentScreen, updateTotalTime }: { projectId: string, taskId: string, currentScreen: string, updateTotalTime: (totalMinutes: number) => void }) {
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntry | null>(null);
    const [showCreateTimeEntryModal, setShowCreateTimeEntryModal] = useState(false);
    const { key } = useTaskRefreshContext();

    const fetchTimeEntries = async () => {
        try {
            const entries = await getTaskTimeEntries(projectId, taskId);
            setTimeEntries(entries);
            updateTotalTime(entries.reduce((total, entry) => total + entry.duration, 0));
        } catch {
            notify.error("Error fetching time entries. Please try again later.");
        }
    };

    useEffect(() => {
        if (!taskId || !projectId) return;
        const fetchData = async () => {
            try {
                const entries = await getTaskTimeEntries(projectId, taskId);
                setTimeEntries(entries);
                updateTotalTime(entries.reduce((total, entry) => total + entry.duration, 0));
            } catch {
                notify.error("Error fetching time entries. Please try again later.");
            }
        };
        fetchData();
    }, [taskId, projectId, key, updateTotalTime]);


    return (
        <div className="mt-6 w-full ">
            <div className="header-time-log flex items-center justify-between mb-2 border-t border-gray-200 py-2">
                <h3 className="group cursor-pointer relative text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Logged Time Entries
                    <p className="w-[200px] absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-green-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                        Open task page to add new time entries.
                    </p>
                </h3>

                <div className="total-time">
                    <span className="text-sm font-medium text-gray-500">
                        Total Time Logged: {formatMinutes(timeEntries.reduce((total, entry) => total + entry.duration, 0))}
                    </span>
                </div>
                {currentScreen === "task-page" && (
                    <button
                        onClick={() => setShowCreateTimeEntryModal(true)}
                        className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-blue-700 cursor-pointer"
                    >
                        Add Time Entry
                    </button>
                )}
            </div>
            {timeEntries.length > 0 ? (
                <div className="max-h-[200px] space-y-3 overflow-y-scroll thumb-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <div className="flex flex-col gap-3">
                        {timeEntries.map((entry) => (
                            <TimeEntryListCard
                                key={entry.id}
                                timeEntry={entry}
                                onClick={() => {
                                    setCurrentTimeEntry(entry);
                                }}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-10 text-center">
                    <p className="text-sm font-medium text-gray-500">
                        No time entries found
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                        Start tracking time to see entries here.
                    </p>
                </div>
            )}
            {
                currentTimeEntry && (
                    <TimeEntryManageModal
                        projectId={projectId}
                        taskId={taskId}
                        timeEntry={currentTimeEntry}
                        onClose={() => {
                            setCurrentTimeEntry(null);
                            fetchTimeEntries();
                        }}
                        onUpdate={() => {
                            fetchTimeEntries();
                        }}
                    />
                )
            }
            {
                showCreateTimeEntryModal && (
                    <TimeEntryManageModal
                        projectId={projectId}
                        taskId={taskId}
                        onClose={() => {
                            setShowCreateTimeEntryModal(false);
                            fetchTimeEntries();
                        }}
                        onUpdate={() => {
                            fetchTimeEntries();
                        }}
                    />
                )
            }
        </div>
    );
}