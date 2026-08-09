import router from "express";
import TaskController from "../controllers/taskController";

const taskRouter = router.Router({ mergeParams: true });;

/**
 * @openapi
 * /api/projects/{projectId}/tasks:
 *   post:
 *     summary: Create a new task
 *     description: Creates a new task under the specified project.
 *     tags:
 *       - Tasks
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project to which the task belongs.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       201:
 *         description: Task created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request. Missing required task data.
 *       403:
 *         description: Forbidden. Access denied.
 *       404:
 *         description: Not found. Project not found.
 *       500:
 *         description: Internal server error.
 */
taskRouter.post("/", TaskController.createTask);

/**
 * @openapi
 * /api/projects/{projectId}/tasks:
 *   get:
 *     summary: Get tasks for a project
 *     description: Retrieves a list of tasks for the specified project.
 *     tags:
 *       - Tasks
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project whose tasks are to be retrieved.
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of projects per page.
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [title, createdAt, updatedAt, dueDate, priority, status]
 *           default: createdAt
 *         description: Field to sort by.
 *       - in: query
 *         name: sortOrder
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order.
 *     responses:
 *       200:
 *         description: A paginated list of tasks for the specified project.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of tasks in the project.
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request. Missing required task data.
 *       403:
 *         description: Forbidden. Access denied.
 *       404:
 *         description: Not found. Project not found.
 *       500:
 *         description: Internal server error.
 *       
 */
taskRouter.get("/", TaskController.getProjectTasks);

/**
 * @openapi
 * /api/projects/{projectId}/tasks/all:
 *   get:
 *     summary: Get all tasks for a project
 *     description: Retrieves a list of all tasks for the specified project.
 *     tags:
 *       - Tasks
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project whose tasks are to be retrieved.
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of projects per page.
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [title, createdAt, updatedAt, dueDate, priority, status]
 *           default: createdAt
 *         description: Field to sort by.
 *       - in: query
 *         name: sortOrder
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order.
 *     responses:
 *       200:
 *         description: A list of tasks for the specified project.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request. Missing required task data.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden. Access denied.
 *       404:
 *         description: Not found. Project not found.
 *       500:
 *         description: Internal server error.
 *       
 */
taskRouter.get("/all", TaskController.getAllProjectTasks);


/**
 * @openapi
 * /api/projects/{projectId}/tasks/{taskId}:
 *   get:
 *     summary: Get a task by ID
 *     description: Returns a single task if it belongs to the authenticated user.
 *     tags:
 *       - Tasks
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID.
 *     responses:
 *       200:
 *         description: Task retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden. Access denied.
 *       404:
 *         description: Task not found.
 *       500:
 *         description: Internal server error.
 */
taskRouter.get("/:taskId", TaskController.getTaskById);

/**
 * @openapi
 * /api/projects/{projectId}/tasks/{taskId}:
 *   put:
 *     summary: Update a task by ID
 *     description: Updates a single task if it belongs to the authenticated user.
 *     tags:
 *       - Tasks
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
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       200:
 *         description: Task updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden. Access denied.
 *       404:
 *         description: Task not found.
 *       500:
 *         description: Internal server error.
 */
taskRouter.put("/:taskId", TaskController.updateTask);

/**
 * @openapi
 * /api/projects/{projectId}/tasks/{taskId}:
 *   delete:
 *     summary: Delete a task by ID
 *     description: Deletes a single task if it belongs to the authenticated user.
 *     tags:
 *       - Tasks
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID.
 *     responses:
 *       204:
 *         description: Task deleted successfully.
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden. Access denied.
 *       404:
 *         description: Task not found.
 *       500:
 *         description: Internal server error.
 */
taskRouter.delete("/:taskId", TaskController.deleteTask);

export default taskRouter;