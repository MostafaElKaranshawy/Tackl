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