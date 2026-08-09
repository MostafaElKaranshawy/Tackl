
export default interface QueryParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    filterStatus?: string;
    filterPriority?: string;
    filterOverDue?: boolean;
}