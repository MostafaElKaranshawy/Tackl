import type Task from "../../types/task";
import TaskCard from "./TaskListCard";
import { useLocation, useNavigate } from "react-router-dom";
import { useTaskRefreshContext } from "../../contexts/TaskRefreshContext";
import { useEffect } from "react";

export default function TasksList({ tasks, refresh }: { tasks: Task[], refresh: () => void }) {
    const navigate = useNavigate();
    const location = useLocation();

    const { key } = useTaskRefreshContext();

    const handleTaskClick = (taskId: string) => {
        navigate(`${location.pathname}?taskId=${taskId}`);
    }

    useEffect(() => {
        refresh();
    }, [key]);
    return (
        <div className="overflow-y-auto max-h-[300px] space-y-4">
            {tasks.map((task) => (
                <TaskCard key={task.id} task={task} refresh={refresh} onClick={() => {
                    handleTaskClick(task.id);
                }}
                />
            ))}
        </div>
    );
}