export default interface Task {
    id: string;
    title: string;
    description: string | null;
    status: "todo" | "in_progress" | "done";
    priority: "low" | "medium" | "high";
    dueDate: string | null;
    estimatedTime: number | null;
    projectId: string;
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
    overdue: boolean | false;
};