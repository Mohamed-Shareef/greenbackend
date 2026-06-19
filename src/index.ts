import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import salesRoutes from "./routes/sales";
import purchaseOrdersRoutes from "./routes/purchaseOrders";
import purchasesRoutes from "./routes/purchases";
import purchaseReturnsRoutes from "./routes/purchaseReturns";
import saleReturnsRoutes from "./routes/saleReturns";
import stockRoutes from "./routes/stock";
import suppliersRoutes from "./routes/suppliers";
import clientsRoutes from "./routes/clients";
import productsRoutes from "./routes/products";
import estimatesRoutes from "./routes/estimates";
import salesOrdersRoutes from "./routes/salesOrders";
import deliveriesRoutes from "./routes/deliveries";
import paymentsMadeRoutes from "./routes/paymentsMade";
import cashBookRoutes from "./routes/cashBook";
import bankAccountsRoutes from "./routes/bankAccounts";
import usersRoutes from "./routes/users";
import tenantsRoutes from "./routes/tenants";
import authRoutes from "./routes/auth";
import stockMovementsRoutes from "./routes/stockMovements";
import cashAccountsRoutes from "./routes/cashAccounts";
import cashTransactionsRoutes from "./routes/cashTransactions";
import bankTransactionsRoutes from "./routes/bankTransactions";
import reportsRoutes from "./routes/reports";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Existing routes
app.use("/api/sales", salesRoutes);
app.use("/api/purchaseOrders", purchaseOrdersRoutes);
app.use("/api/purchases", purchasesRoutes);
app.use("/api/purchaseReturns", purchaseReturnsRoutes);
app.use("/api/saleReturns", saleReturnsRoutes);
app.use("/api/stock", stockRoutes);

// New routes
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/estimates", estimatesRoutes);
app.use("/api/salesOrders", salesOrdersRoutes);
app.use("/api/deliveries", deliveriesRoutes);
app.use("/api/paymentsMade", paymentsMadeRoutes);
app.use("/api/cashBook", cashBookRoutes);
app.use("/api/bankAccounts", bankAccountsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/tenants", tenantsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stockMovements", stockMovementsRoutes);
app.use("/api/cashAccounts", cashAccountsRoutes);
app.use("/api/cashTransactions", cashTransactionsRoutes);
app.use("/api/bankTransactions", bankTransactionsRoutes);
app.use("/api/reports", reportsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Backend is running" });
});

AppDataSource.initialize()
  .then(() => {
    console.log("✓ Database connected successfully");
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
    process.exit(1);
  });
