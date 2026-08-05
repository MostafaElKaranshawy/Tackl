import router from "express";
import TimeEntryController from "../controllers/timeEntryController";

const timeEntryRouter = router.Router({ mergeParams: true });


/**
 * @swagger
 * /api/tasks/{taskId}/time-entries:
 *   post:
 *     summary: Create a time entry
 *     tags: [Time Entries]
 *     security:

 *       - cookieAuth: []
 *     parameters:
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
 *             type: object
 *             required:
 *               - duration
 *               - date
 *             properties:
 *               duration:
 *                 type: number
 *                 example: 120
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-04T10:00:00Z"
 *               note:
 *                 type: string
 *                 example: Worked on API implementation.
 *     responses:
 *       201:
 *         description: Time entry created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimeEntry'
 *       400:
 *         description: Missing required data.
 *       403:
 *         description: Forbidden.
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
 * /api/tasks/{taskId}/time-entries:
 *   get:
 *     summary: Get all time entries for a task
 *     tags: [Time Entries]
 *     security:
 *       - cookieAuth: []
 *     parameters:
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
 *       403:
 *         description: Forbidden.
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
 * /api/tasks/{taskId}/time-entries/{timeEntryId}:
 *   get:
 *     summary: Get a time entry by ID
 *     tags: [Time Entries]
 *     security:
 *       - cookieAuth: []
 *     parameters:
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
 *       403:
 *         description: Forbidden.
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
 * /api/tasks/{taskId}/time-entries/{timeEntryId}:
 *   put:
 *     summary: Update a time entry
 *     tags: [Time Entries]
 *     security:
 *       - cookieAuth: []
 *     parameters:
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
 *             type: object
 *             properties:
 *               duration:
 *                 type: number
 *                 example: 180
 *               date:
 *                 type: string
 *                 format: date-time
 *               note:
 *                 type: string
 *                 example: Updated work log.
 *     responses:
 *       200:
 *         description: Time entry updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimeEntry'
 *       400:
 *         description: Missing required data.
 *       403:
 *         description: Forbidden.
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
 * /api/tasks/{taskId}/time-entries/{timeEntryId}:
 *   delete:
 *     summary: Delete a time entry
 *     tags: [Time Entries]
 *     security:
 *       - cookieAuth: []
 *     parameters:
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
 *         description: Time entry deleted.
 *       403:
 *         description: Forbidden.
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