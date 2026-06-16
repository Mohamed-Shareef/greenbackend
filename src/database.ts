import dotenv from "dotenv";

dotenv.config();

export const dataSource = process.env.NODE_ENV === "production"
  ? {
      type: "postgres" as const,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "5432"),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ["dist/entities/*.js"],
      migrations: ["dist/migrations/*.js"],
      synchronize: false,
      logging: false,
    }
  : {
      type: "postgres" as const,
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "smartpos_db",
      entities: ["src/entities/*.ts"],
      migrations: ["src/migrations/*.ts"],
      synchronize: false,
      logging: false,
    };
