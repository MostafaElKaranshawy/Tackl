import { Sequelize, DataTypes, Op } from "sequelize";
import logger from "./logger";

const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

sequelize
  .authenticate()
  .then(() => {
    logger.info("Database connection has been established successfully.");
  })
  .catch((err: unknown) => {
    logger.error("Unable to connect to the database:", err);
  });

export { sequelize, DataTypes, Op };