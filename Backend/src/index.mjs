import express from "express";

import {sequelize} from "./config/database.mjs";

sequelize.authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
  
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Hello, Express with ES Modules!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});