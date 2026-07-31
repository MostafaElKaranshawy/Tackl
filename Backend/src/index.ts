import express, { Request, Response } from "express";
import "./config/env";

import { sequelize } from "./config/database";
import "./models/models";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synchronized successfully.");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error("Error synchronizing the database:", err);
  });

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express with TypeScript!");
});