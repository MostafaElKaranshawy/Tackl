import axios from 'axios';
import type Task from '../types/task';
import type { CreateTaskDto, GetProjectTasksOptions, UpdateTaskDto } from '../types/task';
import type TaskHistory from '../types/taskHistory';

const API_URL = import.meta.env.VITE_API_URL + "/api/projects";

const getProjectTasks = async (projectId: string, options: GetProjectTasksOptions): Promise<{ total: number; tasks: Task[] }> => {
    const params = {
        page: options.page,
        limit: options.pageSize,
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
        search: options.search,
        status: options.status,
        priority: options.priority,
        overdue: options.overdue,
    };

    const response = await axios.get(`${API_URL}/${projectId}/tasks`, {
        withCredentials: true,
        params,
    });

    return response.data;
};

const getAllProjectTasks = async (
    projectId: string,
    options?: { sortBy: string; sortOrder: string })
    : Promise<Task[]> => {
    const response = await axios.get(`${API_URL}/${projectId}/tasks/all`, {
        withCredentials: true,
        params: {
            sortBy: options?.sortBy,
            sortOrder: options?.sortOrder
        }
    });
    return response.data;
};

const getTaskById = async (taskId: string, projectId: string): Promise<{ task: Task, taskHistories: TaskHistory[] }> => {
    const response = await axios.get(`${API_URL}/${projectId}/tasks/${taskId}`, { withCredentials: true });
    return { task: response.data.task, taskHistories: response.data.taskHistories || [] };
};
const createTask = async (taskData: CreateTaskDto, projectId: string): Promise<{ task: Task, taskHistories: TaskHistory[] }> => {
    const response = await axios.post(`${API_URL}/${projectId}/tasks`, taskData, { withCredentials: true });
    return { task: response.data.task, taskHistories: response.data.taskHistories || [] };
}

const updateTask = async (taskId: string, updatedData: UpdateTaskDto, projectId: string): Promise<{ task: Task, taskHistories: TaskHistory[] }> => {
    const response = await axios.put(`${API_URL}/${projectId}/tasks/${taskId}`, updatedData, { withCredentials: true });
    return { task: response.data.task, taskHistories: response.data.taskHistories || [] };
}

const deleteTask = async (taskId: string, projectId: string) => {
    await axios.delete(`${API_URL}/${projectId}/tasks/${taskId}`, { withCredentials: true });
}

export {
    getProjectTasks,
    getAllProjectTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
}