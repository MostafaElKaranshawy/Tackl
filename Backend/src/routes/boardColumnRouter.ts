import router from "express";
import BoardColumnController from "../controllers/boardColumnController";

const boardColumnRouter = router.Router({mergeParams: true});

/**
 * @openapi
 * /api/projects/{projectId}/board-columns:
 *   post:
 *     summary: Create a new board column
 *     description: Creates a new board column for a project owned by the authenticated user.
 *     tags:
 *       - Board Columns
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
 *             $ref: '#/components/schemas/BoardColumnInput'
 *     responses:
 *       201:
 *         description: Board column created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BoardColumn'
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
boardColumnRouter.post(
    "/",
    BoardColumnController.createBoardColumn
);

/**
 * @openapi
 * /api/projects/{projectId}/board-columns:
 *   get:
 *     summary: Get all board columns
 *     description: Returns all board columns belonging to a project owned by the authenticated user.
 *     tags:
 *       - Board Columns
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
 *         description: List of board columns.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BoardColumn'
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
boardColumnRouter.get(
    "/",
    BoardColumnController.getBoardColumnsByProjectId
);

/**
 * @openapi
 * /api/projects/{projectId}/board-columns/{boardColumnId}:
 *   get:
 *     summary: Get a board column by ID
 *     description: Returns a single board column belonging to the specified project.
 *     tags:
 *       - Board Columns
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
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Board column ID.
 *     responses:
 *       200:
 *         description: Board column retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BoardColumn'
 *       400:
 *         description: Invalid request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Board column or project not found.
 *       500:
 *         description: Internal server error.
 */
boardColumnRouter.get(
    "/:boardColumnId",
    BoardColumnController.getBoardColumnById
);

/**
 * @openapi
 * /api/projects/{projectId}/board-columns/{boardColumnId}:
 *   put:
 *     summary: Update a board column
 *     description: Updates a board column belonging to a project owned by the authenticated user.
 *     tags:
 *       - Board Columns
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
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Board column ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoardColumnInput'
 *     responses:
 *       200:
 *         description: Board column updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BoardColumn'
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Board column or project not found.
 *       500:
 *         description: Internal server error.
 */
boardColumnRouter.put(
    "/:boardColumnId",
    BoardColumnController.updateBoardColumn
);

/**
 * @openapi
 * /api/projects/{projectId}/board-columns/{boardColumnId}:
 *   delete:
 *     summary: Delete a board column
 *     description: Deletes a board column belonging to a project owned by the authenticated user.
 *     tags:
 *       - Board Columns
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
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Board column ID.
 *     responses:
 *       204:
 *         description: Board column deleted successfully.
 *       400:
 *         description: Invalid request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Board column or project not found.
 *       500:
 *         description: Internal server error.
 */
boardColumnRouter.delete(
    "/:boardColumnId",
    BoardColumnController.deleteBoardColumn
);

export default boardColumnRouter;