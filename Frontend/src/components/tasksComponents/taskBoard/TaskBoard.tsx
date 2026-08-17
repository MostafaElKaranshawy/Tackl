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

import {
    SortableContext,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import type Task from "../../../types/task";
import type { Column } from "../../../types/column";

import TaskBoardCard from "./TaskBoardCard";
import SortableColumn from "./SortableColumn";

import { useLocation, useNavigate } from "react-router-dom";
import { useTaskRefreshContext } from "../../../contexts/TaskRefreshContext/useTaskRefreshContext";

import { updateTask } from "../../../services/taskService";

import {
    getProjectTaskStatusByProjectId,
    createProjectTaskStatus,
    updateProjectTaskStatus,
    deleteProjectTaskStatus,
} from "../../../services/taskStatusService";

import BoardColumnModal from "./BoardColumnModal";
import { notify } from "../../../utils/notify";
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

    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const [activeColumn, setActiveColumn] = useState<Column | null>(null);

    const [showCreateColumnModal, setShowCreateColumnModal] = useState(false);

    const [editingColumn, setEditingColumn] = useState<Column | null>(null);

    const [columnStatus, setColumnStatus] = useState("");

    const [creatingColumn, setCreatingColumn] = useState(false);

    const [updatingColumn, setUpdatingColumn] = useState(false);

    const [deletingColumn, setDeletingColumn] = useState(false);

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
                await getProjectTaskStatusByProjectId(
                    projectId
                );

            setBoardColumns(columns);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    notify.error(
                        "Board columns not found"
                    );
                } else if (error.response?.status === 401) {
                    notify.error(
                        "Unauthorized access"
                    );
                } else {
                    notify.error(
                        "Error fetching board columns"
                    );
                }
            } else {
                notify.error(
                    "Error fetching board columns"
                );
            }
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

    const columns = useMemo<Column[]>(
        () =>
            [...boardColumns]
                .sort(
                    (a, b) =>
                        a.order - b.order
                )
                .map((column) => ({
                    ...column,
                    tasks: tasks.filter(
                        (task) =>
                            task.status.toLowerCase() ===
                            column.status.toLocaleLowerCase()
                    ),
                })),
        [boardColumns, tasks]
    );

    const handleDragStart = (event: DragStartEvent) => {
        const activeId =
            event.active.id.toString();
        const column = columns.find(
            (column) =>
                column.status === activeId
        );

        if (column) {
            setActiveColumn(column);
            return;
        }

        const task = tasks.find(
            (task) =>
                task.id === activeId
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

    const handleColumnDragEnd = async (activeStatus: string, overStatus: string) => {
        if (activeStatus === overStatus) {
            return;
        }

        const sortedColumns = [...boardColumns].sort(
            (a, b) =>
                a.order - b.order
        );

        const oldIndex =
            sortedColumns.findIndex(
                (column) =>
                    column.status ===
                    activeStatus
            );

        const newIndex =
            sortedColumns.findIndex(
                (column) =>
                    column.status ===
                    overStatus
            );

        if (
            oldIndex === -1 ||
            newIndex === -1
        ) {
            return;
        }

        const reordered = [...sortedColumns];

        const [movedColumn] =
            reordered.splice(oldIndex, 1);

        reordered.splice(
            newIndex,
            0,
            movedColumn
        );

        const updatedColumns =
            reordered.map(
                (column, index) => ({
                    ...column,
                    order: index,
                })
            );

        setBoardColumns(updatedColumns);

        try {
            await Promise.all(
                updatedColumns.map(
                    (column) =>
                        updateProjectTaskStatus(
                            projectId,
                            column.status,
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
    const handleTaskDragEnd = async (activeId: string, overId: string) => {
        const activeTask = tasks.find(
            (task) =>
                task.id === activeId
        );

        if (!activeTask) {
            return;
        }

        let newStatus: string | undefined;
        const overColumn = columns.find(
            (column) =>
                column.status === overId
        );

        if (overColumn) {
            newStatus =
                overColumn.status;
        } else {
            const overTask = tasks.find(
                (task) =>
                    task.id === overId
            );

            if (overTask) {
                newStatus =
                    overTask.status;
            }
        }

        if (
            !newStatus ||
            newStatus === activeTask.status
        ) {
            return;
        }

        try {
            await updateTask(
                activeTask.id,
                {
                    status: newStatus,
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

    const handleDragEnd = async (event: DragEndEvent) => {
        const activeId =
            event.active.id.toString();

        const overId =
            event.over?.id.toString();

        setActiveTask(null);
        setActiveColumn(null);

        if (!overId) {
            return;
        }
        const isColumnDrag =
            columns.some(
                (column) =>
                    column.status === activeId
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
        setColumnStatus("");
        setShowCreateColumnModal(true);
    };

    const openEditColumnModal = (column: Column) => {
        if (["to do", "in progress", "done"].includes(column.status)) return;
        console.log("Opening edit modal for column:", column);
        setEditingColumn(column);
        setColumnStatus(column.status);
    };

    const closeColumnModal = () => {
        if (
            creatingColumn ||
            updatingColumn
        ) {
            return;
        }

        setShowCreateColumnModal(false);
        setEditingColumn(null);
        setColumnStatus("");
    };

    const handleCreateColumn = async () => {
        const status =
            columnStatus
                .trim()
                .toLowerCase();

        if (!status) {
            return;
        }

        if (
            boardColumns.some(
                (column) =>
                    column.status === status
            )
        ) {
            notify.error(
                "A column with this status already exists."
            );
            return;
        }

        try {
            setCreatingColumn(true);

            const order =
                boardColumns.length;

            await createProjectTaskStatus(
                projectId,
                {
                    status,
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

        const newStatus =
            columnStatus
                .trim()
                .toLowerCase();

        if (!newStatus) {
            return;
        }

        if (
            newStatus !==
            editingColumn.status
        ) {
            const existingColumn =
                boardColumns.find(
                    (column) =>
                        column.status ===
                        newStatus
                );

            if (existingColumn) {
                notify.error(
                    "A column with this status already exists."
                );
                return;
            }
        }

        try {
            setUpdatingColumn(true);
            await updateProjectTaskStatus(
                projectId,
                editingColumn.status,
                {
                    status: newStatus,
                    order: editingColumn.order,
                }
            );

            closeColumnModal();

            await fetchBoardColumns();
            fetchTasks();
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

            await deleteProjectTaskStatus(
                projectId,
                editingColumn.status
            );

            closeColumnModal();

            notify.success(
                "Board column deleted successfully"
            );

            await fetchBoardColumns();
            fetchTasks();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400 || error.response?.status === 409) {
                    notify.error("Cannot delete column with tasks. Please move or delete all tasks in this column first.");
                } else if (error.response?.status === 404) {
                    notify.error("Board column not found");
                } else {
                    notify.error("Error deleting board column");
                }
            } else {
                notify.error("Error deleting board column");
            }
        } finally {
            setDeletingColumn(false);
        }
    };
    const sortableColumnIds =
        columns.map(
            (column) => column.status
        );

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
                                items={
                                    sortableColumnIds
                                }
                                strategy={
                                    horizontalListSortingStrategy
                                }
                            >
                                {columns.map(
                                    (column) => (
                                        <SortableColumn
                                            key={
                                                column.status
                                            }
                                            column={
                                                column
                                            }
                                            onTaskClick={
                                                handleTaskClick
                                            }
                                            onEdit={
                                                openEditColumnModal
                                            }
                                        />
                                    )
                                )}
                            </SortableContext>

                            <button
                                type="button"
                                onClick={
                                    openCreateColumnModal
                                }
                                className="mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-2xl hover:bg-gray-100 cursor-pointer"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <DragOverlay>
                        {activeTask ? (
                            <TaskBoardCard
                                task={
                                    activeTask
                                }
                                onClick={() => { }}
                            />
                        ) : activeColumn ? (
                            <div className="w-[300px] max-h-[300px] rounded-xl border border-gray-200 bg-white px-5 py-4 font-semibold shadow-lg">
                                {
                                    activeColumn.status
                                }
                            </div>
                        ) : null}
                    </DragOverlay>
                </div>
            </DndContext>

            {(showCreateColumnModal ||
                editingColumn) && (
                    <BoardColumnModal
                        editingColumn={!!editingColumn}
                        columnStatus={columnStatus}
                        creatingColumn={creatingColumn}
                        updatingColumn={updatingColumn}
                        deletingColumn={deletingColumn}
                        onStatusChange={setColumnStatus}
                        onClose={closeColumnModal}
                        onSubmit={editingColumn ? handleUpdateColumn : handleCreateColumn}
                        onDelete={handleDeleteColumn}
                    />
                )}
        </>
    );
}