import type { TaskStatus } from "./taskStatus";

export default interface Task {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: "low" | "medium" | "high";
    dueDate: string | null;
    estimatedTime: number | null;
    projectId: string;
    columnId: string | null;
    createdAt: string;
    updatedAt: string;
}
export type CreateTaskDto = Omit<Task, "id" | "createdAt" | "updatedAt" | "projectId">;
export type UpdateTaskDto = Partial<Task>;

export type GetProjectTasksOptions = {
    page?: number;
    pageSize?: number;
    sortBy: string;
    sortOrder: string;
    search: string;
    status?: string;
    priority?: string;
    columnId?: string;
    overdue: boolean | false;
};