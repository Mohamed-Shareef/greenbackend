import "reflect-metadata";
import { DataSource } from "typeorm";
import { Sale } from "./entities/Sale";
import { SaleItem } from "./entities/SaleItem";
import { PurchaseOrder } from "./entities/PurchaseOrder";
import { OrderItem } from "./entities/OrderItem";
import { Purchase } from "./entities/Purchase";
import { PurchaseItem } from "./entities/PurchaseItem";
import { PurchaseReturn } from "./entities/PurchaseReturn";
import { PurchaseReturnItem } from "./entities/PurchaseReturnItem";
import { SaleReturn } from "./entities/SaleReturn";
import { SaleReturnItem } from "./entities/SaleReturnItem";
import { Stock } from "./entities/Stock";

const isProduction = process.env.NODE_ENV === "production";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "smartpos_db",
  entities: [
    Sale,
    SaleItem,
    PurchaseOrder,
    OrderItem,
    Purchase,
    PurchaseItem,
    PurchaseReturn,
    PurchaseReturnItem,
    SaleReturn,
    SaleReturnItem,
    Stock,
  ],
  migrations: isProduction ? ["dist/migrations/*.js"] : ["src/migrations/*.ts"],
  synchronize: false,
  logging: !isProduction,
});
