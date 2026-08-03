import axios from 'axios';
import type Task from '../types/task';
import type { CreateTaskDto, UpdateTaskDto } from '../types/task';

const API_URL = import.meta.env.VITE_API_URL + "/api/projects";

const getProjectTasks = async (
    projectId: string,
    options: { page?: number; pageSize?: number; sortBy: string; sortOrder: string, search: string, [key: string]: any })
    : Promise<{ total: number; tasks: Task[] }> => {
    try {
        const params = {
            page: options.page,
            limit: options.pageSize,
            sortBy: options.sortBy,
            sortOrder: options.sortOrder,
            search: options.search,
            status: options.status,
            priority: options.priority,
            overdue: options.overdue
        }
        const response = await axios.get(`${API_URL}/${projectId}/tasks`, {
            withCredentials: true,
            params: {
                ...params
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getAllProjectTasks = async (
    projectId: string,
    options?: { sortBy: string; sortOrder: string })
    : Promise<Task[]> => {
    try {
        const response = await axios.get(`${API_URL}/${projectId}/tasks/all`, {
            withCredentials: true,
            params: {
                sortBy: options?.sortBy,
                sortOrder: options?.sortOrder
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getTaskById = async (taskId: string, projectId: string): Promise<Task> => {
    try {
        const response = await axios.get(`${API_URL}/${projectId}/tasks/${taskId}`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error;
    }
};
const createTask = async (taskData: CreateTaskDto, projectId: string): Promise<Task> => {
    try {
        const response = await axios.post(`${API_URL}/${projectId}/tasks`, taskData, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error;
    }
}

const updateTask = async (taskId: string, updatedData: UpdateTaskDto, projectId: string): Promise<Task> => {
    try {
        const response = await axios.put(`${API_URL}/${projectId}/tasks/${taskId}`, updatedData, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error;
    }
}

const deleteTask = async (taskId: string, projectId: string) => {
    try {
        await axios.delete(`${API_URL}/${projectId}/tasks/${taskId}`, { withCredentials: true });
    } catch (error) {
        throw new Error("Failed to delete task: " + (error as Error).message);
    }
}
export {
    getProjectTasks,
    getAllProjectTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
}