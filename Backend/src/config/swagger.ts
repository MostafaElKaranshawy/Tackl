import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

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
                            enum: ["todo", "in-progress", "done"],
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
                        changeType: {
                            type: "string",
                            enum: ["created", "updated", "deleted"],
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
                            enum: ["created", "updated", "deleted"],
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
                    },
                },
                TimeEntry: {
                    id: {
                        type: "string",
                        format: "uuid",
                    },
                    duration: {
                        type: "number",
                    },
                    date: {
                        type: "string",
                        format: "date-time",
                    },
                    note: {
                        type: "string",
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
            }
        },
        security: [
            {
                cookieAuth: [],
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/**/*.ts"], // location of your Swagger comments
};

const swaggerSpec = swaggerJsdoc(options);

export default function setupSwagger(app: Express) {
    console.log("Swagger is running at: " + appUrl + "/api-docs");
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}