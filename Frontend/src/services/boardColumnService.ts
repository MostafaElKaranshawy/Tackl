import axios from "axios";
import type { TaskStatus } from "../types/taskStatus";
import type { Column } from "../types/column";

const API_URL =
    import.meta.env.VITE_API_URL + "/api/projects";

const getBoardColumnsByProjectId = async (
    projectId: string
): Promise<Column[]> => {
    const response = await axios.get(
        `${API_URL}/${projectId}/board-columns`,
        {
            withCredentials: true,
        }
    );

    return response.data;
};

const getBoardColumnById = async (
    projectId: string,
    id: string
) => {
    const response = await axios.get(
        `${API_URL}/${projectId}/board-columns/${id}`,
        {
            withCredentials: true,
        }
    );

    return response.data;
};

const createBoardColumn = async (
    projectId: string,
    boardColumnData: {
        name: string;
        status: TaskStatus;
        order: number;
    }
) => {
    const response = await axios.post(
        `${API_URL}/${projectId}/board-columns`,
        boardColumnData,
        {
            withCredentials: true,
        }
    );

    return response.data;
};

const updateBoardColumn = async (
    projectId: string,
    id: string,
    updatedData: {
        name?: string;
        status?: TaskStatus;
        order?: number;
    }) => {
    const response = await axios.put(
        `${API_URL}/${projectId}/board-columns/${id}`,
        updatedData,
        {
            withCredentials: true,
        }
    );

    return response.data;
};

const deleteBoardColumn = async (projectId: string, id: string) => {
    await axios.delete(
        `${API_URL}/${projectId}/board-columns/${id}`,
        {
            withCredentials: true,
        }
    );
};

export {
    getBoardColumnsByProjectId,
    getBoardColumnById,
    createBoardColumn,
    updateBoardColumn,
    deleteBoardColumn,
};