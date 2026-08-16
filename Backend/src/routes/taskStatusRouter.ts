import router from "express";
import TaskStatusController from "../controllers/taskStatusController";

const taskStatusRouter = router.Router({mergeParams: true});

/**
 * @openapi
 * /api/projects/{projectId}/task-statuses:
 *   post:
 *     summary: Create a new task status
 *     description: Creates a new task status for a project owned by the authenticated user.
 *     tags:
 *       - Task Statuses
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskStatusInput'
 *     responses:
 *       201:
 *         description: Task status created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskStatus'
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Project not found.
 *       500:
 *         description: Internal server error.
 */
taskStatusRouter.post(
    "/",
    TaskStatusController.createTaskStatus
);

/**
 * @openapi
 * /api/projects/{projectId}/task-statuses:
 *   get:
 *     summary: Get all task statuses
 *     description: Returns all task statuses belonging to a project owned by the authenticated user.
 *     tags:
 *       - Task Statuses
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID.
 *     responses:
 *       200:
 *         description: List of task statuses.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TaskStatus'
 *       400:
 *         description: Project ID is required.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Project not found.
 *       500:
 *         description: Internal server error.
 */
taskStatusRouter.get(
    "/",
    TaskStatusController.getTaskStatusesByProjectId
);

/**
 * @openapi
 * /api/projects/{projectId}/task-statuses/{status}:
 *   get:
 *     summary: Get a task status by status name
 *     description: Returns a single task status belonging to the specified project.
 *     tags:
 *       - Task Statuses
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID.
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *         description: Task status name.
 *     responses:
 *       200:
 *         description: Task status retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskStatus'
 *       400:
 *         description: Invalid request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Task status or project not found.
 *       500:
 *         description: Internal server error.
 */
taskStatusRouter.get(
    "/:taskStatusId",
    TaskStatusController.getTaskStatusById
);

/**
 * @openapi
 * /api/projects/{projectId}/task-statuses/{status}:
 *   put:
 *     summary: Update a task status
 *     description: Updates a task status belonging to a project owned by the authenticated user.
 *     tags:
 *       - Task Statuses
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID.
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *         description: Task status name.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskStatusInput'
 *     responses:
 *       200:
 *         description: Task status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskStatus'
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Task status or project not found.
 *       500:
 *         description: Internal server error.
 */
taskStatusRouter.put(
    "/:taskStatusId",
    TaskStatusController.updateTaskStatus
);

/**
 * @openapi
 * /api/projects/{projectId}/task-statuses/{status}:
 *   delete:
 *     summary: Delete a task status
 *     description: Deletes a task status belonging to a project owned by the authenticated user.
 *     tags:
 *       - Task Statuses
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID.
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *         description: Task status name.
 *     responses:
 *       204:
 *         description: Task status deleted successfully.
 *       400:
 *         description: Invalid request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Task status or project not found.
 *       500:
 *         description: Internal server error.
 */
taskStatusRouter.delete(
    "/:taskStatusId",
    TaskStatusController.deleteTaskStatus
);

export default taskStatusRouter;