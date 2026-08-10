export default interface TaskChange {
    id: string;
    fieldName: string;
    oldValue?: string | null;
    newValue?: string | null;
    actionType: "created" | "updated" | "deleted";
    taskHistoryId: string;
}