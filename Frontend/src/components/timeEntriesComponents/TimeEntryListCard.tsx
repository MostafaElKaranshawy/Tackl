import type TimeEntry from "../../types/timeEntry";
import { FiClock, FiCalendar, FiFileText } from "react-icons/fi";
import { formatMinutes } from "../../utils/timeFormater";

export default function TimeEntryListCard({ timeEntry, onClick }: { timeEntry: TimeEntry; onClick: () => void }) {
    return (
        <div onClick={onClick} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                    <FiClock className="text-blue-600" />
                    <span className="font-semibold">
                        {formatMinutes(timeEntry.duration)}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FiCalendar />
                    <span>
                        {new Date(timeEntry.date).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <div className="mt-3 border-t border-gray-100 pt-3">
                <div className="flex items-start gap-2">
                    <FiFileText className="mt-1 shrink-0 text-gray-400" />
                    <p className="text-sm text-gray-600">
                        {timeEntry.note?.trim() || (
                            <span className="italic text-gray-400">
                                No note provided
                            </span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}