import type Task from "./task";
import type { TaskStatus } from "./taskStatus";

export type Column = {
    id: string;
    key: string;
    status: TaskStatus;
    name: string;
    order: number;
    tasks: Task[];
};