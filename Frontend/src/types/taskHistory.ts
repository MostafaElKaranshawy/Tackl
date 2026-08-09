import type TaskChange from "./taskChange";

export default interface TaskHistory {
    id: string;
    taskId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    taskChanges?: TaskChange[];
}