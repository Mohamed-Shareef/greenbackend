import "reflect-metadata";
import dotenv from "dotenv";
import { DataSource } from "typeorm";

dotenv.config({ override: true });
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
import { Tenant } from "./entities/Tenant";
import { User } from "./entities/User";

const isProduction = process.env.NODE_ENV === "production";
const isSupabase = !!process.env.DB_HOST?.includes("supabase");

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "postgres",
  ssl: isSupabase ? { rejectUnauthorized: false } : false,
  extra: isSupabase ? { max: 1 } : undefined,
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
    Tenant,
    User,
  ],
  migrations: isProduction ? ["dist/migrations/*.js"] : ["src/migrations/*.ts"],
  synchronize: false,
  logging: !isProduction,
});
