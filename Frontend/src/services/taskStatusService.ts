import axios from "axios";
import type { Column } from "../types/column";

const API_URL =
    import.meta.env.VITE_API_URL + "/api/projects";

const getProjectTaskStatusByProjectId = async (projectId: string): Promise<Column[]> => {
    const response = await axios.get(
        `${API_URL}/${projectId}/task-statuses`,
        {
            withCredentials: true,
        }
    );

    return response.data;
};

const getProjectTaskStatusByPK = async (projectId: string, status: string) => {
    const response = await axios.get(
        `${API_URL}/${projectId}/task-statuses/${status}`,
        {
            withCredentials: true,
        }
    );

    return response.data;
};

const createProjectTaskStatus = async (
    projectId: string,
    boardColumnData: {
        status: string;
        order: number;
    }
) => {
    const response = await axios.post(
        `${API_URL}/${projectId}/task-statuses`,
        boardColumnData,
        {
            withCredentials: true,
        }
    );

    return response.data;
};

const updateProjectTaskStatus = async (projectId: string, status: string,
    updatedData: {
        status?: string;
        order?: number;
    }) => {
    const response = await axios.put(
        `${API_URL}/${projectId}/task-statuses/${status}`,
        updatedData,
        {
            withCredentials: true,
        }
    );

    return response.data;
};

const deleteProjectTaskStatus = async (projectId: string, status: string) => {
    await axios.delete(
        `${API_URL}/${projectId}/task-statuses/${status}`,
        {
            withCredentials: true,
        }
    );
};

export {
    getProjectTaskStatusByProjectId,
    getProjectTaskStatusByPK,
    createProjectTaskStatus,
    updateProjectTaskStatus,
    deleteProjectTaskStatus,
};