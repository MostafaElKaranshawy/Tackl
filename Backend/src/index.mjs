import express from "express";
import dotenv from "./config/env.mjs";

import {sequelize} from "./config/database.mjs";
import models from "./models/models.mjs";

sequelize.sync({ alter: true })
  .then(() => {
    console.log("Database synchronized successfully.");
  })
  .catch((err) => {
    console.error("Error synchronizing the database:", err);
  });
  
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Hello, Express with ES Modules!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});