import express, { Request, Response } from "express";
import "./config/env";
import cookieParser from "cookie-parser";
import "./models/models";
import baseRouter from "./routes/baseRouter";
import setupSwagger from "./config/swagger";
import cors from "cors";
import ReqResLogger from "./middlewares/reqResLogger";
import errorHandler from "./middlewares/errorHandler";

const app = express();

app.use(express.json());

app.use(
    cors({
        origin: process.env.FRONTEND_LINK,
        credentials: true,
    })
);

app.use(cookieParser());

app.use(ReqResLogger);

app.use("/api", baseRouter);

app.use(errorHandler);

setupSwagger(app);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, Express with TypeScript!");
});

export default app;