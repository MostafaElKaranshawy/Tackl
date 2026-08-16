import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { TaskPriority } from "../enums/taskPriority";
import logger from "./logger";
import { ActionType } from "../enums/actionType";

const appUrl = process.env.APP_SERVER + ":" + process.env.PORT;
const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Tackl API",
            version: "1.0.0",
            description: "REST API documentation for Tackl",
        },
        servers: [
            {
                url: appUrl,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "accessToken",
                },
            },
            schemas: {
                ProjectInput: {
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: {
                            type: "string",
                            example: "My Project",
                        },
                        description: {
                            type: "string",
                            example: "Project description",
                        },
                    },
                },
                Project: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid",
                        },
                        name: {
                            type: "string",
                        },
                        description: {
                            type: "string",
                        },
                        ownerId: {
                            type: "string",
                            format: "uuid",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },
                User: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid",
                        },
                        name: {
                            type: "string",
                        },
                        email: {
                            type: "string",
                            format: "email",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },
                Task: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid",
                        },
                        title: {
                            type: "string",
                        },
                        description: {
                            type: "string",
                        },
                        status: {
                            type: "string",
                        },
                        priority: {
                            type: "string",
                            enum: TaskPriority,
                        },
                        estimatedTime: {
                            type: "number",
                        },
                        dueDate: {
                            type: "string",
                            format: "date-time",
                        },
                        projectId: {
                            type: "string",
                            format: "uuid",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },
                TaskInput: {
                    type: "object",
                    required: ["title"],
                    properties: {
                        title: {
                            type: "string",
                            example: "My Task",
                        },
                        description: {
                            type: "string",
                            example: "Task description",
                        },
                        priority: {
                            type: "string",
                            enum: TaskPriority,
                            example: "medium",
                        },
                        status: {
                            type: "string",
                            example: "to do",
                        },
                        dueDate: {
                            type: "string",
                            format: "date-time",
                            example: "2023-12-31T23:59:59Z",
                        },
                        estimatedTime: {
                            type: "number",
                            example: 120,
                        },
                    },
                },
                TaskChange: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid",
                        },
                        taskId: {
                            type: "string",
                            format: "uuid",
                        },
                        changedBy: {
                            type: "string",
                            format: "uuid",
                        },
                        actionType: {
                            type: "string",
                            enum: ActionType,
                        },
                        changeDetails: {
                            type: "string",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },
                TaskHistory: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid",
                        },
                        actionType: {
                            type: "string",
                            enum: ActionType,
                        },
                        taskId: {
                            type: "string",
                            format: "uuid",
                        },
                        userId: {
                            type: "string",
                            format: "uuid",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                        },
                        taskChanges: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/TaskChange"
                            }
                        },
                        actionBy: {
                            type: "object",
                            properties: {
                                name: {
                                    type: "string",
                                },
                            },
                        },
                        fieldName: {
                            type: "string",
                        },
                    },
                },
                TimeEntry: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid",
                        },
                        duration: {
                            type: "number",
                            example: 120,
                        },
                        date: {
                            type: "string",
                            format: "date-time",
                            example: "2026-08-04T10:00:00Z",
                        },
                        note: {
                            type: "string",
                            example: "Worked on API implementation.",
                        },
                        taskId: {
                            type: "string",
                            format: "uuid",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },

                TimeEntryInput: {
                    type: "object",
                    required: ["duration", "date"],
                    properties: {
                        duration: {
                            type: "number",
                            example: 120,
                        },
                        date: {
                            type: "string",
                            format: "date-time",
                            example: "2026-08-04T10:00:00Z",
                        },
                        note: {
                            type: "string",
                            example: "Worked on API implementation.",
                        },
                    },
                },
                TaskStatus: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid",
                        },
                        name: {
                            type: "string",
                        },
                        status: {
                            type: "string",
                        },
                        order: {
                            type: "number",
                        },
                        projectId: {
                            type: "string",
                            format: "uuid",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },
                TaskStatusInput: {
                    type: "object",
                    required: ["name", "status", "order"],
                    properties: {
                        name: {
                            type: "string",
                            example: "To Do",
                        },
                        status: {
                            type: "string",
                            example: "to do",
                        },
                        order: {
                            type: "number",
                            example: 1,
                        },
                    },
                },
            }
        },
        security: [
            { cookieAuth: [] },
            { bearerAuth: [] },
        ],
    },
    apis: ["./dist/routes/**/*.js", "./src/routes/**/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default function setupSwagger(app: Express) {
    logger.info("Swagger is running at: " + appUrl + "/api-docs");
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}