import { useEffect, useMemo, useRef, useState } from "react";

import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragMoveEvent,
    type DragStartEvent,
} from "@dnd-kit/core";

import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";

import type Task from "../../../types/task";
import type { Column } from "../../../types/column";

import TaskBoardCard from "./TaskBoardCard";
import TaskBoardColumn from "./TaskBoardColumn";
import SortableColumn from "./SortableColumn";

import { useLocation, useNavigate } from "react-router-dom";
import { useTaskRefreshContext } from "../../../contexts/TaskRefreshContext/useTaskRefreshContext";

import { updateTask } from "../../../services/taskService";

import {
    getBoardColumnsByProjectId,
    createBoardColumn,
    updateBoardColumn,
    deleteBoardColumn,
} from "../../../services/boardColumnService";
import BoardColumnModal from "./BoardColumnModal";
import { notify } from "../../../utils/notify";
import type { TaskStatus } from "../../../types/taskStatus";
import axios from "axios";



export default function TaskBoard({
    projectId,
    tasks,
    fetchTasks,
}: {
    projectId: string;
    tasks: Task[];
    fetchTasks: () => void;
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const { key } = useTaskRefreshContext();

    const boardRef = useRef<HTMLDivElement | null>(null);

    const [boardColumns, setBoardColumns] = useState<
        Column[]
    >([]);

    const [activeTask, setActiveTask] =
        useState<Task | null>(null);

    const [activeColumn, setActiveColumn] =
        useState<Column | null>(null);

    const [showCreateColumnModal, setShowCreateColumnModal] =
        useState(false);

    const [editingColumn, setEditingColumn] =
        useState<Column | null>(null);

    const [columnName, setColumnName] =
        useState("");

    const [columnStatus, setColumnStatus] =
        useState<TaskStatus>("todo");

    const [creatingColumn, setCreatingColumn] =
        useState(false);

    const [updatingColumn, setUpdatingColumn] =
        useState(false);

    const [deletingColumn, setDeletingColumn] =
        useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        fetchTasks();
    }, [projectId, key]);

    useEffect(() => {
        fetchBoardColumns();
    }, [projectId]);

    const fetchBoardColumns = async () => {
        try {
            const columns =
                await getBoardColumnsByProjectId(projectId);

            setBoardColumns(columns);
        } catch (error) {
            console.error(
                "Error fetching board columns:",
                error
            );
        }
    };

    const handleTaskClick = (taskId: string) => {
        const searchParams = new URLSearchParams(
            location.search
        );

        searchParams.set("taskId", taskId);

        navigate({
            pathname: location.pathname,
            search: `?${searchParams.toString()}`,
        });
    };

    const mainColumns: Column[] = useMemo(
        () => [
            {
                id: "todo",
                key: "todo",
                status: "todo",
                name: "To Do",
                order: 0,
                tasks: tasks.filter(
                    (task) =>
                        task.status === "todo" &&
                        !task.columnId
                ),
            },
            {
                id: "in_progress",
                key: "in_progress",
                status: "in_progress",
                name: "In Progress",
                order: 0,
                tasks: tasks.filter(
                    (task) =>
                        task.status ===
                            "in_progress" &&
                        !task.columnId
                ),
            },
            {
                id: "done",
                key: "done",
                status: "done",
                name: "Done",
                order: 0,
                tasks: tasks.filter(
                    (task) =>
                        task.status === "done" &&
                        !task.columnId
                ),
            },
        ],
        [tasks]
    );

    const customColumns: Column[] = useMemo(
        () =>
            boardColumns.map((column) => ({
                id: column.id,
                key: column.id,
                status: column.status,
                name: column.name,
                order: column.order,
                tasks: tasks.filter(
                    (task) =>
                        task.columnId && task.columnId === column.id
                ),
            })),
        [boardColumns, tasks]
    );

    const orderedColumns = useMemo(() => {
        const result: Column[] = [];

        const statuses: TaskStatus[] = [
            "todo",
            "in_progress",
            "done",
        ];

        for (const status of statuses) {
            const mainColumn = mainColumns.find(
                (column) =>
                    column.status === status
            );

            if (mainColumn) {
                result.push(mainColumn);
            }

            const extraColumns = customColumns
                .filter(
                    (column) =>
                        column.status === status
                )
                .sort((a, b) => {
                    const aOrder =
                        boardColumns.find(
                            (item) =>
                                item.id === a.id
                        )?.order ?? 0;

                    const bOrder =
                        boardColumns.find(
                            (item) =>
                                item.id === b.id
                        )?.order ?? 0;

                    return aOrder - bOrder;
                });

            result.push(...extraColumns);
        }

        return result;
    }, [
        mainColumns,
        customColumns,
        boardColumns,
    ]);

    const handleDragStart = (
        event: DragStartEvent
    ) => {
        const activeId = event.active.id.toString();

        const column = orderedColumns.find(
            (column) => column.id === activeId
        );

        if (
            column &&
            !["todo", "in_progress", "done"].includes(
                column.id
            )
        ) {
            setActiveColumn(column);
            return;
        }

        const task = tasks.find(
            (task) => task.id === activeId
        );

        if (task) {
            setActiveTask(task);
        }
    };

    const handleDragMove = (event: DragMoveEvent) => {
        if (!activeColumn || !boardRef.current) {
            return;
        }

        const board = boardRef.current;

        const activeNode = document.querySelector(
            `[data-sortable-id="${event.active.id}"]`
        ) as HTMLElement | null;

        if (!activeNode) {
            return;
        }

        const activeRect =
            activeNode.getBoundingClientRect();

        const boardRect =
            board.getBoundingClientRect();

        const edgeThreshold = 120;
        const maxScrollSpeed = 20;

        if (
            activeRect.right >
            boardRect.right - edgeThreshold
        ) {
            const distance =
                activeRect.right -
                (boardRect.right - edgeThreshold);

            const speed = Math.min(
                maxScrollSpeed,
                Math.max(5, distance / 5)
            );

            board.scrollLeft += speed;
        }

        if (
            activeRect.left <
            boardRect.left + edgeThreshold
        ) {
            const distance =
                boardRect.left +
                edgeThreshold -
                activeRect.left;

            const speed = Math.min(
                maxScrollSpeed,
                Math.max(5, distance / 5)
            );

            board.scrollLeft -= speed;
        }
    };

    const handleDragCancel = () => {
        setActiveTask(null);
        setActiveColumn(null);
    };

    const handleColumnDragEnd = async (
        activeId: string,
        overId: string
    ) => {
        const activeColumn = boardColumns.find(
            (column) => column.id === activeId
        );

        const overColumn = boardColumns.find(
            (column) => column.id === overId
        );

        if (!activeColumn || !overColumn) {
            return;
        }

        if (
            activeColumn.status !==
            overColumn.status
        ) {
            return;
        }

        const statusColumns = boardColumns
            .filter(
                (column) =>
                    column.status ===
                    activeColumn.status
            )
            .sort(
                (a, b) => a.order - b.order
            );

        const oldIndex = statusColumns.findIndex(
            (column) =>
                column.id === activeId
        );

        const newIndex = statusColumns.findIndex(
            (column) =>
                column.id === overId
        );

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        const reordered = [...statusColumns];

        const [movedColumn] =
            reordered.splice(oldIndex, 1);

        reordered.splice(newIndex, 0, movedColumn);

        const updatedColumns =
            reordered.map((column, index) => ({
                ...column,
                order: index,
            }));

        setBoardColumns((current) =>
            current.map((column) => {
                const updated =
                    updatedColumns.find(
                        (item) =>
                            item.id === column.id
                    );

                return updated ?? column;
            })
        );

        try {
            await Promise.all(
                updatedColumns.map((column) =>
                    updateBoardColumn(
                        projectId,
                        column.id,
                        {
                            order: column.order,
                        }
                    )
                )
            );
        } catch (error) {
            console.error(
                "Error updating column order:",
                error
            );

            await fetchBoardColumns();
        }
    };

    const handleTaskDragEnd = async (
        activeId: string,
        overId: string
    ) => {
        const activeTask = tasks.find(
            (task) => task.id === activeId
        );

        if (!activeTask) {
            return;
        }

        const mainColumnIds = [
            "todo",
            "in_progress",
            "done",
        ];

        let newStatus: TaskStatus | undefined;
        let newColumnId: string | null =
            activeTask.columnId || null;

        const overColumn = orderedColumns.find(
            (column) => column.id === overId
        );

        if (overColumn) {
            newStatus = overColumn.status;
            newColumnId = mainColumnIds.includes(
                overColumn.id
            )
                ? null
                : overColumn.id;
        } else {
            const overTask = tasks.find(
                (task) => task.id === overId
            );

            if (overTask) {
                newStatus = overTask.status;
                newColumnId =
                    overTask.columnId || null;
            }
        }

        const statusChanged =
            newStatus !== undefined &&
            newStatus !== activeTask.status;

        const columnChanged =
            newColumnId !==
            (activeTask.columnId || null);

        if (!statusChanged && !columnChanged) {
            return;
        }

        try {
            await updateTask(
                activeTask.id,
                {
                    ...(newStatus !== undefined && {
                        status: newStatus,
                    }),
                    columnId:
                        newColumnId as string,
                },
                projectId
            );

            fetchTasks();
        } catch (error) {
            console.error(
                "Error updating task:",
                error
            );
        }
    };

    const handleDragEnd = async (
        event: DragEndEvent
    ) => {
        const activeId = event.active.id.toString();
        const overId = event.over?.id.toString();

        setActiveTask(null);
        setActiveColumn(null);

        if (!overId) {
            return;
        }

        const isColumnDrag = boardColumns.some(
            (column) => column.id === activeId
        );

        if (isColumnDrag) {
            await handleColumnDragEnd(
                activeId,
                overId
            );

            return;
        }

        await handleTaskDragEnd(
            activeId,
            overId
        );
    };

    const openCreateColumnModal = () => {
        setColumnName("");
        setColumnStatus("todo");
        setShowCreateColumnModal(true);
    };

    const openEditColumnModal = (
        column: Column
    ) => {
        setEditingColumn(column);
        setColumnName(column.name);
        setColumnStatus(column.status);
    };

    const closeColumnModal = () => {
        if (creatingColumn || updatingColumn) {
            return;
        }

        setShowCreateColumnModal(false);
        setEditingColumn(null);
        setColumnName("");
        setColumnStatus("todo");
    };

    const handleCreateColumn = async () => {
        const name = columnName.trim();

        if (!name) {
            return;
        }

        try {
            setCreatingColumn(true);

            const order = boardColumns.filter(
                (column) =>
                    column.status === columnStatus
            ).length;

            await createBoardColumn(
                projectId,
                {
                    name,
                    status: columnStatus,
                    order,
                }
            );

            closeColumnModal();

            await fetchBoardColumns();
        } catch (error) {
            console.error(
                "Error creating board column:",
                error
            );
        } finally {
            setCreatingColumn(false);
        }
    };

    const handleUpdateColumn = async () => {
        if (!editingColumn) {
            return;
        }

        const name = columnName.trim();

        if (!name) {
            return;
        }

        try {
            setUpdatingColumn(true);

            const oldColumn =
                boardColumns.find(
                    (column) =>
                        column.id ===
                        editingColumn.id
                );

            const data: {
                name: string;
                status: TaskStatus;
                order: number;
            } = {
                name,
                status: columnStatus,
                order:
                    oldColumn?.order ?? 0,
            };

            if (
                oldColumn &&
                oldColumn.status !== columnStatus
            ) {
                data.order =
                    boardColumns.filter(
                        (column) =>
                            column.status ===
                            columnStatus
                    ).length;
            }

            await updateBoardColumn(
                projectId,
                editingColumn.id,
                data
            );

            closeColumnModal();

            await fetchBoardColumns();
        } catch (error) {
            console.error(
                "Error updating board column:",
                error
            );
        } finally {
            setUpdatingColumn(false);
        }
    };

    const handleDeleteColumn = async () => {
        if (!editingColumn) {
            return;
        }

        try {
            setDeletingColumn(true);
            console.log("Deleting column:", editingColumn.id);
            await deleteBoardColumn(
                projectId,
                editingColumn.id
            );

            closeColumnModal();

            notify.success(
                "Board column deleted successfully"
            );
            await fetchBoardColumns();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    notify.error(
                        "Cannot delete column with tasks. Please move or delete all tasks in this column first."
                    );
                }
                else if (error.response?.status === 404) {
                    notify.error(
                        "Board column not found"
                    );
                }
                else if (error.response?.status === 409) {
                    notify.error(
                        "Cannot delete column with tasks. Please move or delete all tasks in this column first."
                    );
                }
                else {
                    notify.error(
                        "Error deleting board column"
                    );
                }
            } else {
                notify.error(
                    "Error deleting board column"
                );
            }
        } finally {
            setDeletingColumn(false);
        }
    };

    const sortableColumnIds = orderedColumns
        .filter(
            (column) =>
                ![
                    "todo",
                    "in_progress",
                    "done",
                ].includes(column.id)
        )
        .map((column) => column.id);

    return (
        <>
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div className="min-w-0 w-full">
                    <div
                        ref={boardRef}
                        className="w-full min-w-0 overflow-x-auto overflow-y-hidden"
                    >
                        <div className="flex w-max min-w-full items-start gap-2">
                            <SortableContext
                                items={sortableColumnIds}
                                strategy={horizontalListSortingStrategy}
                            >
                                {orderedColumns.map((column) => {
                                    const isMainColumn = [
                                        "todo",
                                        "in_progress",
                                        "done",
                                    ].includes(column.id);

                                    if (isMainColumn) {
                                        return (
                                            <div
                                                key={column.id}
                                                className="w-[280px] shrink-0"
                                            >
                                                <TaskBoardColumn
                                                    column={column}
                                                    onTaskClick={
                                                        handleTaskClick
                                                    }
                                                />
                                            </div>
                                        );
                                    }

                                    return (
                                        <SortableColumn
                                            key={column.id}
                                            column={column}
                                            onTaskClick={
                                                handleTaskClick
                                            }
                                            onEdit={
                                                openEditColumnModal
                                            }
                                        />
                                    );
                                })}
                            </SortableContext>

                            <button
                                type="button"
                                onClick={openCreateColumnModal}
                                className="mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-2xl hover:bg-gray-100 cursor-pointer"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <DragOverlay>
                        {activeTask ? (
                            <TaskBoardCard
                                task={activeTask}
                                onClick={() => { }}
                            />
                        ) : activeColumn ? (
                            <div className="w-[300px] max-h-[300px] rounded-xl border border-gray-200 bg-white px-5 py-4 font-semibold shadow-lg">
                                {activeColumn.name}
                            </div>
                        ) : null}
                    </DragOverlay>
                </div>
            </DndContext>
            {(showCreateColumnModal || editingColumn) && (
                <BoardColumnModal
                    editingColumn={!!editingColumn}
                    columnName={columnName}
                    columnStatus={columnStatus}
                    creatingColumn={creatingColumn}
                    updatingColumn={updatingColumn}
                    deletingColumn={deletingColumn}
                    onNameChange={setColumnName}
                    onStatusChange={setColumnStatus}
                    onClose={closeColumnModal}
                    onSubmit={
                        editingColumn
                            ? handleUpdateColumn
                            : handleCreateColumn
                    }
                    onDelete={handleDeleteColumn}
                />
            )}
        </>
    );
}