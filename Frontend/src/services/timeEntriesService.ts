import axios from 'axios';
import type TimeEntry from '../types/timeEntry';


const API_URL = import.meta.env.VITE_API_URL + "/api/projects/";

const getTaskTimeEntries = async (projectId: string, taskId: string): Promise<TimeEntry[]> => {
    try {
        const response = await axios.get(
            `${API_URL}${projectId}/tasks/${taskId}/time-entries`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch time entries for task ${taskId}: ${(error as Error).message}`);
    }
}

const updateTimeEntry = async (projectId: string, taskId: string, timeEntryId: string, updatedData: Partial<TimeEntry>): Promise<TimeEntry> => {
    try {
        const response = await axios.put(
            `${API_URL}${projectId}/tasks/${taskId}/time-entries/${timeEntryId}`,
            updatedData,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        throw new Error(`Failed to update time entry ${timeEntryId}: ${(error as Error).message}`);
    }
}

const deleteTimeEntry = async (projectId: string, taskId: string, timeEntryId: string): Promise<void> => {
    try {
        await axios.delete(
            `${API_URL}${projectId}/tasks/${taskId}/time-entries/${timeEntryId}`,
            { withCredentials: true }
        );
    } catch (error) {
        throw new Error(`Failed to delete time entry ${timeEntryId}: ${(error as Error).message}`);
    }
}

const createTimeEntry = async (projectId: string, taskId: string, newTimeEntry: Partial<TimeEntry>): Promise<TimeEntry> => {
    try {
        const response = await axios.post(
            `${API_URL}${projectId}/tasks/${taskId}/time-entries`,
            newTimeEntry,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        throw new Error(`Failed to create time entry for task ${taskId}: ${(error as Error).message}`);
    }
}

const getTimeEntryById = async (projectId: string, taskId: string, timeEntryId: string): Promise<TimeEntry> => {
    try {
        const response = await axios.get(
            `${API_URL}${projectId}/tasks/${taskId}/time-entries/${timeEntryId}`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch time entry ${timeEntryId} for task ${taskId}: ${(error as Error).message}`);
    }
}

export {
    getTaskTimeEntries,
    updateTimeEntry,
    deleteTimeEntry,
    createTimeEntry,
    getTimeEntryById
};