import axios from 'axios';
import type TaskHistory from '../types/taskHistory';

const API_URL = import.meta.env.VITE_API_URL + "/api/projects";


export const getTaskHistory = async (projectId: string, taskId: string): Promise<TaskHistory[]> => {
    const response = await axios.get(`${API_URL}/${projectId}/tasks/${taskId}/history`, { withCredentials: true });
    return response.data;
};