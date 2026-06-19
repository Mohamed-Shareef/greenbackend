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
import { Supplier } from "./entities/Supplier";
import { Client } from "./entities/Client";
import { Product } from "./entities/Product";
import { Estimate } from "./entities/Estimate";
import { EstimateItem } from "./entities/EstimateItem";
import { SalesOrder } from "./entities/SalesOrder";
import { SalesOrderItem } from "./entities/SalesOrderItem";
import { Delivery } from "./entities/Delivery";
import { DeliveryItem } from "./entities/DeliveryItem";
import { PaymentMade } from "./entities/PaymentMade";
import { CashBook } from "./entities/CashBook";
import { BankAccount } from "./entities/BankAccount";
import { StockMovement } from "./entities/StockMovement";
import { BillPayment } from "./entities/BillPayment";
import { InvoicePayment } from "./entities/InvoicePayment";
import { CashAccount } from "./entities/CashAccount";
import { CashTransaction } from "./entities/CashTransaction";
import { BankTransaction } from "./entities/BankTransaction";

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
    Sale, SaleItem,
    PurchaseOrder, OrderItem,
    Purchase, PurchaseItem,
    PurchaseReturn, PurchaseReturnItem,
    SaleReturn, SaleReturnItem,
    Stock, Tenant, User,
    Supplier, Client, Product,
    Estimate, EstimateItem,
    SalesOrder, SalesOrderItem,
    Delivery, DeliveryItem,
    PaymentMade, CashBook, BankAccount,
    StockMovement, BillPayment, InvoicePayment,
    CashAccount, CashTransaction, BankTransaction,
  ],
  migrations: isProduction ? ["dist/migrations/*.js"] : ["src/migrations/*.ts"],
  synchronize: false,
  logging: !isProduction,
});
