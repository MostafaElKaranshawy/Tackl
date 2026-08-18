import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + "/api/projects";

const getProjects = async (options: { page: number; pageSize: number; sortBy: string; sortOrder: string, search?: string }) => {
    const response = await axios.get(`${API_URL}`, {
        withCredentials: true,
        params: {
            page: options.page,
            limit: options.pageSize,
            sortBy: options.sortBy,
            sortOrder: options.sortOrder,
            search: options.search || undefined
        }
    });
    return response.data;
};
const getProjectById = async (projectId: string) => {
    const response = await axios.get(`${API_URL}/${projectId}`, { withCredentials: true });
    return response.data;
};
const createProject = async (projectData: { name: string; description: string }) => {
    const response = await axios.post(`${API_URL}`, projectData, { withCredentials: true });
    return response.data;
}

const updateProject = async (projectId: string, updatedData: { name?: string; description?: string }) => {
    const response = await axios.put(`${API_URL}/${projectId}`, updatedData, { withCredentials: true });
    return response.data;
}

const deleteProject = async (projectId: string) => {
    await axios.delete(`${API_URL}/${projectId}`, { withCredentials: true });
}
export {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
}