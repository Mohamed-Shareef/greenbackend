import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Sale } from "../entities/Sale";
import { Purchase } from "../entities/Purchase";
import { SalesOrder } from "../entities/SalesOrder";
import { Product } from "../entities/Product";
import { Client } from "../entities/Client";

const router = Router();

// GET /api/reports/summary
router.get("/summary", async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };

    const saleQb = AppDataSource.getRepository(Sale).createQueryBuilder("s");
    const purchaseQb = AppDataSource.getRepository(Purchase).createQueryBuilder("p");
    const soQb = AppDataSource.getRepository(SalesOrder).createQueryBuilder("so");

    if (from) {
      saleQb.andWhere("s.date >= :from", { from });
      purchaseQb.andWhere("p.date >= :from", { from });
    }
    if (to) {
      saleQb.andWhere("s.date <= :to", { to });
      purchaseQb.andWhere("p.date <= :to", { to });
    }

    const [sales, purchases, pendingOrders, lowStockProducts, activeClients] = await Promise.all([
      saleQb.select("SUM(s.total)", "total").addSelect("COUNT(s.id)", "count").getRawOne(),
      purchaseQb.select("SUM(p.total)", "total").addSelect("COUNT(p.id)", "count").getRawOne(),
      soQb.where("so.status = :s", { s: "pending" }).getCount(),
      AppDataSource.getRepository(Product).createQueryBuilder("p").where("p.currentStock < 100").getCount(),
      AppDataSource.getRepository(Client).createQueryBuilder("c").getCount(),
    ]);

    res.json({
      success: true,
      data: {
        totalSales: parseFloat(sales?.total || "0"),
        saleCount: parseInt(sales?.count || "0"),
        totalPurchases: parseFloat(purchases?.total || "0"),
        purchaseCount: parseInt(purchases?.count || "0"),
        pendingOrders,
        lowStockCount: lowStockProducts,
        activeClients,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reports/top-products
router.get("/top-products", async (req: Request, res: Response) => {
  try {
    const { from, to, limit = "10" } = req.query as { from?: string; to?: string; limit?: string };

    const qb = AppDataSource.getRepository(Sale)
      .createQueryBuilder("s")
      .innerJoin("s.items", "si")
      .select("si.productName", "productName")
      .addSelect("SUM(si.amount)", "revenue")
      .addSelect("SUM(si.quantity)", "unitsSold")
      .groupBy("si.productName")
      .orderBy("revenue", "DESC")
      .limit(parseInt(limit));

    if (from) qb.andWhere("s.date >= :from", { from });
    if (to) qb.andWhere("s.date <= :to", { to });

    const data = await qb.getRawMany();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reports/top-clients
router.get("/top-clients", async (req: Request, res: Response) => {
  try {
    const { from, to, limit = "10" } = req.query as { from?: string; to?: string; limit?: string };

    const qb = AppDataSource.getRepository(Sale)
      .createQueryBuilder("s")
      .select("s.customerName", "clientName")
      .addSelect("SUM(s.total)", "totalPurchases")
      .addSelect("COUNT(s.id)", "orderCount")
      .groupBy("s.customerName")
      .orderBy("totalPurchases", "DESC")
      .limit(parseInt(limit));

    if (from) qb.andWhere("s.date >= :from", { from });
    if (to) qb.andWhere("s.date <= :to", { to });

    const data = await qb.getRawMany();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reports/stock-valuation
router.get("/stock-valuation", async (_req: Request, res: Response) => {
  try {
    const products = await AppDataSource.getRepository(Product).find({ order: { name: "ASC" } });

    let totalCostValue = 0;
    let totalSaleValue = 0;

    const data = products.map((p) => {
      const qty = parseFloat(p.currentStock as any);
      const costValue = qty * parseFloat(p.purchasePrice as any);
      const saleValue = qty * parseFloat(p.salePrice as any);
      totalCostValue += costValue;
      totalSaleValue += saleValue;
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        qty,
        unit: p.unit,
        purchasePrice: parseFloat(p.purchasePrice as any),
        salePrice: parseFloat(p.salePrice as any),
        costValue,
        saleValue,
      };
    });

    res.json({ success: true, data, totalCostValue, totalSaleValue });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
