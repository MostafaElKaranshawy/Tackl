import app from "./app";
import logger from "./config/logger";
import { sequelize } from "./config/database";

const PORT = Number(process.env.PORT) || 3000;

sequelize
  .sync({ alter: false })
  .then(() => {
    logger.info("Database synchronized successfully.");

    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    logger.error("Failed to synchronize database:", error);
    process.exit(1);
  });