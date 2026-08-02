import type Task from "../../types/task";
import TaskCard from "./TaskCard";

export default function TasksList({tasks, refresh}: {tasks: Task[], refresh: () => void}) {
    return (
        <div className="overflow-y-auto max-h-[300px] space-y-4">
            {tasks.map((task) => (
                <TaskCard key={task.id} task={task} refresh={refresh} />
            ))}
        </div>
    );
}