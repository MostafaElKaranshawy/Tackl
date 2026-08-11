import express, { Request, Response } from "express";
import "./config/env";
import cookieParser from "cookie-parser";
import logger from "./config/logger";
import "./models/models";
import baseRouter from "./routes/baseRouter";
import setupSwagger from "./config/swagger";
import cors from "cors";
import { sequelize } from "./config/database";
import ReqResLogger from "./middlewares/reqResLogger";
import errorHandler from "./middlewares/errorHandler";

const app = express();
const PORT = Number(process.env.PORT) || 3000;


sequelize
  .sync({ alter: false })
  .then(() => {
    logger.info("Database synchronized successfully.");

    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });
  })

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_LINK,
  credentials: true,
}));
app.use(cookieParser());

app.use(ReqResLogger);
app.use("/api", baseRouter);
app.use(errorHandler);

setupSwagger(app);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express with TypeScript!");
});


const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down server...`);

  try {
    await sequelize.close();
    logger.info("Database connection closed.");

    process.exit(0);
  } catch (error) {
    logger.error("Error during server shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));