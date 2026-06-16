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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/sales", salesRoutes);
app.use("/api/purchaseOrders", purchaseOrdersRoutes);
app.use("/api/purchases", purchasesRoutes);
app.use("/api/purchaseReturns", purchaseReturnsRoutes);
app.use("/api/saleReturns", saleReturnsRoutes);
app.use("/api/stock", stockRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Backend is running" });
});

// Initialize database and start server
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
