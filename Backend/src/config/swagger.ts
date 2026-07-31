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