import router from "express";
import TaskHistoryController from "../controllers/taskHistoryController";

const taskHistoryRouter = router.Router({ mergeParams: true });;


/**
 * @openapi
 * /api/projects/{projectId}/tasks/{taskId}/history:
 *   get:
 *     summary: Get task history
 *     description: Retrieves the history of changes for the specified task.
 *     tags:
 *       - TaskHistory
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project whose tasks are to be retrieved.
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task for which to retrieve history.
 *     responses:
 *       200:
 *         description: A list of task history entries for the specified task.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TaskHistory'
 *       400:
 *         description: Bad request. Missing required data.
 *       403:
 *         description: Forbidden. Access denied.
 *       404:
 *         description: Not found. Task not found.
 *       500:
 *         description: Internal server error.
 */
taskHistoryRouter.get(
    "/",
    TaskHistoryController.getTaskHistory
);

export default taskHistoryRouter;