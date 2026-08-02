import { useEffect, useRef, useState } from "react";
import type Task from "../../types/task";
import TaskCard from "./TaskCard";
import TaskShow from "./TaskShow";

export default function TasksList({ tasks, refresh }: { tasks: Task[], refresh: () => void }) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const selectedTaskRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                selectedTaskRef.current &&
                !selectedTaskRef.current.contains(event.target as Node)
            ) {
                setSelectedTask(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [selectedTaskRef]);
    
    return (
        <div className="overflow-y-auto max-h-[300px] space-y-4">
            {tasks.map((task) => (
                <TaskCard key={task.id} task={task} refresh={refresh} onClick={() => setSelectedTask(task)} />
            ))}
            {
                selectedTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                        <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg" ref={selectedTaskRef}>
                            <TaskShow taskId={selectedTask.id} projectId={selectedTask.projectId}
                                refresh={async (close) => {
                                    refresh();
                                    if (close) {
                                        setSelectedTask(null);
                                    }
                                }} />
                        </div>
                    </div>
                )
            }
        </div>
    );
}