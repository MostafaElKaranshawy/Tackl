import { Sequelize, DataTypes, Op } from "sequelize";

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
    console.log("Database connection has been established successfully.");
  })
  .catch((err: unknown) => {
    console.error("Unable to connect to the database:", err);
  });

export { sequelize, DataTypes, Op };