export default interface TaskChange {
    id: string;
    fieldName: string;
    oldValue?: string | null;
    newValue?: string | null;
    actionType: "CREATED" | "UPDATED" | "DELETED";
    taskHistoryId: string;
}