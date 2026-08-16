import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Column } from "../../../types/column";
import TaskBoardColumn from "./TaskBoardColumn";

export default function SortableColumn({
    column,
    onTaskClick,
    onEdit,
}: {
    column: Column;
    onTaskClick: (taskId: string) => void;
    onEdit: (column: Column) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: column.status,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            data-sortable-id={column.status}
            className="w-[300px] shrink-0"
        >
            <TaskBoardColumn
                column={column}
                onTaskClick={onTaskClick}
                headerProps={{
                    attributes,
                    listeners,
                    onClick: () => onEdit(column),
                }}
            />
        </div>
    );
}