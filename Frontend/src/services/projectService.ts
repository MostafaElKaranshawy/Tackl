import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + "/api/projects";

const getProjects = async (options: { page: number; pageSize: number; sortBy: string; sortOrder: string }) => {
    try {
        const response = await axios.get(`${API_URL}`, {
            withCredentials: true,
            params: {
                page: options.page,
                limit: options.pageSize,
                sortBy: options.sortBy,
                sortOrder: options.sortOrder
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
const getProjectById = async (projectId: string) => {
    try {
        const response = await axios.get(`${API_URL}/${projectId}`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error;
    }
};
const createProject = async (projectData: { name: string; description: string }) => {
    try {
        const response = await axios.post(`${API_URL}`, projectData, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error;
    }
}

const updateProject = async (projectId: string, updatedData: { name?: string; description?: string }) => {
    try {
        const response = await axios.put(`${API_URL}/${projectId}`, updatedData, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error;
    }
}

const deleteProject = async (projectId: string) => {
    try {
        await axios.delete(`${API_URL}/${projectId}`, { withCredentials: true });
    } catch (error) {
        throw new Error("Failed to delete project: " + (error as Error).message);
    }
}
export {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
}