import { useEffect, useState } from "react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";

import type Task from "../../../types/task";
import TaskBoardCard from "./TaskBoardCard";
import { useLocation, useNavigate } from "react-router-dom";
import { useTaskRefreshContext } from "../../../contexts/TaskRefreshContext/useTaskRefreshContext";
import { updateTask } from "../../../services/taskService";
import TaskBoardColumn from "./TaskBoardColumn";
import type { Column } from "../../../types/column";

export type TaskStatus = "todo" | "in_progress" | "done";

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

    const [activeTask, setActiveTask] = useState<Task | null>(null);
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

    const handleTaskClick = (taskId: string) => {
        const searchParams = new URLSearchParams(location.search);

        searchParams.set("taskId", taskId);

        navigate({
            pathname: location.pathname,
            search: `?${searchParams.toString()}`,
        });
    };

    const todoTasks = tasks.filter(
        (task) => task.status === "todo"
    );

    const inProgressTasks = tasks.filter(
        (task) => task.status === "in_progress"
    );

    const doneTasks = tasks.filter(
        (task) => task.status === "done"
    );

    const columns: Column[] = [
        {
            key: "todo",
            title: "To Do",
            tasks: todoTasks,
        },
        {
            key: "in_progress",
            title: "In Progress",
            tasks: inProgressTasks,
        },
        {
            key: "done",
            title: "Done",
            tasks: doneTasks,
        },
    ];

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find(
            (task) => task.id === event.active.id
        );

        if (task) {
            setActiveTask(task);
        }
    };

    const handleDragCancel = () => {
        setActiveTask(null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveTask(null);

        const { active, over } = event;

        if (!over) return;

        const activeTask = tasks.find(
            (task) => task.id === active.id
        );

        if (!activeTask) return;

        const overId = over.id.toString();

        let newStatus: TaskStatus | undefined;

        // Mouse ended over a column
        if (overId.startsWith("column-")) {
            newStatus = overId.replace(
                "column-",
                ""
            ) as TaskStatus;
        }

        // Mouse ended over another task
        else {
            const overTask = tasks.find(
                (task) => task.id === over.id
            );

            if (overTask) {
                newStatus = overTask.status;
            }
        }

        if (!newStatus) return;

        // Nothing changed
        if (newStatus === activeTask.status) return;

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
                "Error updating task status:",
                error
            );
        }
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
                {columns.map((column) => (
                    <TaskBoardColumn
                        key={column.key}
                        column={column}
                        onTaskClick={handleTaskClick}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeTask ? (
                    <TaskBoardCard
                        task={activeTask}
                        onClick={() => { }}
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
