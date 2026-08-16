import { useDroppable } from "@dnd-kit/core";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type { Column } from "../../../types/column";
import TaskBoardCard from "./TaskBoardCard";

export default function TaskBoardColumn({
    column,
    onTaskClick,
    headerProps,
}: {
    column: Column;
    onTaskClick: (taskId: string) => void;
    headerProps?: {
        attributes: DraggableAttributes;
        listeners: SyntheticListenerMap | undefined;
        onClick?: () => void;
    };
}) {
    const { setNodeRef } = useDroppable({
        id: column.status,
    });

    return (
        <div
            ref={setNodeRef}
            className="rounded-xl border border-gray-200 bg-gray-50 shadow-sm"
        >
            <div
                {...headerProps?.attributes}
                {...headerProps?.listeners}
                onClick={headerProps?.onClick}
                className={`border-b border-gray-200 px-5 py-4 ${headerProps
                    ? "cursor-grab active:cursor-grabbing"
                    : ""
                    }`}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {column.status.substring(0, 1).toUpperCase() + column.status.substring(1).replace("_", " ")}
                    </h2>

                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {column.tasks.length}
                    </span>
                </div>
            </div>

            <div className="flex max-h-[300px] min-h-[100px] flex-col gap-3 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <SortableContext
                    items={column.tasks.map(
                        (task) => task.id
                    )}
                    strategy={verticalListSortingStrategy}
                >
                    {column.tasks.length > 0 ? (
                        column.tasks.map((task) => (
                            <TaskBoardCard
                                key={task.id}
                                task={task}
                                onClick={() =>
                                    onTaskClick(task.id)
                                }
                            />
                        ))
                    ) : (
                        <div className="flex min-h-[80px] flex-1 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white text-sm text-gray-400">
                            No tasks
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
}