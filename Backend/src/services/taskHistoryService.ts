import TaskHistory from '../models/taskHistory';
import TaskHistoryRepository from '../repositories/taskHistoryRepository';

export default class TaskHistoryService {

    static async getTaskHistoryByTaskId(taskId: string): Promise<TaskHistory[]> {
        return await TaskHistoryRepository.getTaskHistoryByTaskId(taskId);
    }
}