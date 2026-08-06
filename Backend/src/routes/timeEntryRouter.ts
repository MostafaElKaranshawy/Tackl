import router from "express";
import TimeEntryController from "../controllers/timeEntryController";

const timeEntryRouter = router.Router({ mergeParams: true });

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}/time-entries:
 *   post:
 *     summary: Create a time entry
 *     tags: [Time Entries]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TimeEntryInput'
 *     responses:
 *       201:
 *         description: Time entry created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimeEntry'
 *       400:
 *         description: Missing Required Data.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden. Access denied.
 *       404:
 *         description: Task not found.
 *       500:
 *         description: Internal server error.
 */
timeEntryRouter.post(
    "/",
    TimeEntryController.createTimeEntry
);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}/time-entries:
 *   get:
 *     summary: Get all time entries for a task
 *     tags: [Time Entries]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of time entries.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TimeEntry'
 *       400:
 *         description: Missing Required Data.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden. Access denied.
 *       404:
 *         description: Task not found.
 *       500:
 *         description: Internal server error.
 */
timeEntryRouter.get(
    "/",
    TimeEntryController.getTaskTimeEntries
);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}/time-entries/{timeEntryId}:
 *   get:
 *     summary: Get a time entry by ID
 *     tags: [Time Entries]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: timeEntryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Time entry found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimeEntry'
 *       400:
 *         description: Missing Required Data.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden. Access denied.
 *       404:
 *         description: Time entry not found.
 *       500:
 *         description: Internal server error.
 */
timeEntryRouter.get(
    "/:timeEntryId",
    TimeEntryController.getTimeEntryById
);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}/time-entries/{timeEntryId}:
 *   put:
 *     summary: Update a time entry
 *     tags: [Time Entries]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: timeEntryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TimeEntryInput'
 *     responses:
 *       200:
 *         description: Time entry updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimeEntry'
 *       400:
 *         description: Missing Required Data.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden. Access denied.
 *       404:
 *         description: Time entry not found.
 *       500:
 *         description: Internal server error.
 */
timeEntryRouter.put(
    "/:timeEntryId",
    TimeEntryController.updateTimeEntry
);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}/time-entries/{timeEntryId}:
 *   delete:
 *     summary: Delete a time entry
 *     tags: [Time Entries]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: timeEntryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Time entry deleted successfully.
 *       400:
 *         description: Missing Required Data.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden. Access denied.
 *       404:
 *         description: Time entry not found.
 *       500:
 *         description: Internal server error.
 */
timeEntryRouter.delete(
    "/:timeEntryId",
    TimeEntryController.deleteTimeEntry
);

export default timeEntryRouter;