import { useEffect, useState } from "react";
import type TaskHistory from "../../types/taskHistory";
import HistoryCard from "./HistoryCard";
import { IoMdClose } from "react-icons/io";
import { getTaskHistory } from "../../services/taskHistoryService";
interface TaskHistoryListProps {
    taskId: string;
    projectId: string;
    closeTaskHistoryList: () => void;
}


export default function TaskHistoryList({
    taskId,
    projectId,
    closeTaskHistoryList,
}: TaskHistoryListProps) {
    const [historyData, setHistoryData] = useState<TaskHistory[]>([]);
    useEffect(() => {
        if (!taskId || !projectId) {
            return;
        }
        const fetchTaskHistory = async () => {
            const data = await getTaskHistory(projectId, taskId);
            setHistoryData(data);
        };

        fetchTaskHistory();
    }, [taskId, projectId]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={closeTaskHistoryList}
        >
            <div
                className="relative flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Task History
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            View changes made to this task
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeTaskHistoryList}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 cursor-pointer transition-colors hover:bg-gray-100 hover:text-red-700"
                        aria-label="Close history"
                    >
                        <IoMdClose />
                    </button>
                </div>

                {/* History */}
                <div className="flex-1 overflow-y-auto p-4">
                    {historyData.length === 0 ? (
                        <div className="flex min-h-40 items-center justify-center">
                            <p className="text-sm text-gray-400">
                                No history available.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {historyData.map((history) => (
                                <HistoryCard
                                    key={history.id}
                                    history={history}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}