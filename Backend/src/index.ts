import express, { Request, Response } from "express";
import "./config/env";
import cookieParser from "cookie-parser";
import logger from "./config/logger";
import "./models/models";
import baseRouter from "./routes/baseRouter";
import setupSwagger from "./config/swagger";
import cors from "cors";

import ReqResLogger from "./middlewares/reqResLogger";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_LINK,
  credentials: true,
}));
app.use(cookieParser());

app.use(ReqResLogger);
app.use("/api", baseRouter);
setupSwagger(app);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express with TypeScript!");
});