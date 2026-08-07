import { Sequelize, DataTypes, Op } from "sequelize";
import logger from "./logger";

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USERNAME as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "postgres",
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => {
    logger.info("Database connection has been established successfully.");
  })
  .catch((err: unknown) => {
    logger.error("Unable to connect to the database:", err);
  });

export { sequelize, DataTypes, Op };