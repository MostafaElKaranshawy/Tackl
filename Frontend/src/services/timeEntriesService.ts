import axios from 'axios';
import type TimeEntry from '../types/timeEntry';


const API_URL = import.meta.env.VITE_API_URL + "/api/projects/";

const getTaskTimeEntries = async (projectId: string, taskId: string): Promise<TimeEntry[]> => {
    const response = await axios.get(
        `${API_URL}${projectId}/tasks/${taskId}/time-entries`,
        { withCredentials: true }
    );
    return response.data;
}

const updateTimeEntry = async (projectId: string, taskId: string, timeEntryId: string, updatedData: Partial<TimeEntry>): Promise<TimeEntry> => {
    const response = await axios.put(
        `${API_URL}${projectId}/tasks/${taskId}/time-entries/${timeEntryId}`,
        updatedData,
        { withCredentials: true }
    );
    return response.data;
}

const deleteTimeEntry = async (projectId: string, taskId: string, timeEntryId: string): Promise<void> => {
    await axios.delete(
        `${API_URL}${projectId}/tasks/${taskId}/time-entries/${timeEntryId}`,
        { withCredentials: true }
    );
}

const createTimeEntry = async (projectId: string, taskId: string, newTimeEntry: Partial<TimeEntry>): Promise<TimeEntry> => {
    const response = await axios.post(
        `${API_URL}${projectId}/tasks/${taskId}/time-entries`,
        newTimeEntry,
        { withCredentials: true }
    );
    return response.data;
}

const getTimeEntryById = async (projectId: string, taskId: string, timeEntryId: string): Promise<TimeEntry> => {
    const response = await axios.get(
        `${API_URL}${projectId}/tasks/${taskId}/time-entries/${timeEntryId}`,
        { withCredentials: true }
    );
    return response.data;
}

export {
    getTaskTimeEntries,
    updateTimeEntry,
    deleteTimeEntry,
    createTimeEntry,
    getTimeEntryById
};