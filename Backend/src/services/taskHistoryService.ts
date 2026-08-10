import ForbiddenException from '../exceptions/forbiddenException';
import NotFoundException from '../exceptions/notFoundException';
import TaskHistory from '../models/taskHistory';
import TaskHistoryRepository from '../repositories/taskHistoryRepository';
import TaskRepository from '../repositories/taskRepository';
export default class TaskHistoryService {

    static async getTaskHistory(userId: string, projectId: string, taskId: string): Promise<TaskHistory[]> {
        const task = await TaskRepository.getTaskById(taskId);
        if (task == null) {
            throw new NotFoundException("Task not found.");
        }
        if (task.projectId !== projectId) {
            throw new ForbiddenException("Task does not belong to the specified project.");
        }
        if (task.project?.userId !== userId) {
            throw new ForbiddenException("User does not have access to this task.");
        }

        return await TaskHistoryRepository.getTaskHistoryByTaskId(taskId);
    }
}