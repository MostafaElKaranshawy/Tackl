import router from "express";
import ProjectController from "../controllers/projectController.js";

const projectRouter = router.Router();

/**
 * @openapi
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     description: Creates a new project owned by the authenticated user.
 *     tags:
 *       - Projects
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectInput'
 *     responses:
 *       201:
 *         description: Project created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
projectRouter.post("/", ProjectController.createProject);

/**
 * @openapi
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     description: Returns all projects owned by the authenticated user.
 *     tags:
 *       - Projects
 *     security:
 *       - cookieAuth: []
 *     parameters:
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
 *           enum: [name, createdAt]
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
 *         description: List of projects.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 projects:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
projectRouter.get("/", ProjectController.getUserProjects);

/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     description: Returns a single project if it belongs to the authenticated user.
 *     tags:
 *       - Projects
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID.
 *     responses:
 *       200:
 *         description: Project retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Project not found.
 *       500:
 *         description: Internal server error.
 */
projectRouter.get("/:id", ProjectController.getProjectById);

/**
 * @openapi
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project
 *     description: Updates a project owned by the authenticated user.
 *     tags:
 *       - Projects
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             $ref: '#/components/schemas/ProjectInput'
 *     responses:
 *       200:
 *         description: Project updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Project not found.
 *       500:
 *         description: Internal server error.
 */
projectRouter.put("/:id", ProjectController.updateProject);

/**
 * @openapi
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     description: Deletes a project owned by the authenticated user.
 *     tags:
 *       - Projects
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID.
 *     responses:
 *       204:
 *         description: Project deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Project not found.
 *       500:
 *         description: Internal server error.
 */
projectRouter.delete("/:id", ProjectController.deleteProject);

export default projectRouter;