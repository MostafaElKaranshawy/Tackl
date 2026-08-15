import type Task from "./task";

export type Column = {
    key: "todo" | "in_progress" | "done";
    title: string;
    tasks: Task[];
};