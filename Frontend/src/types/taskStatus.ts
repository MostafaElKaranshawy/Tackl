export const TaskStatus = {
    Todo: "todo",
    InProgress: "in_progress",
    Done: "done"
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];