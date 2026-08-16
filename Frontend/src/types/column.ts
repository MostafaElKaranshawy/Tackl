import type Task from "./task";

export type Column = {
    status: string;
    order: number;
    tasks: Task[];
};