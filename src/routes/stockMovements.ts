import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { StockMovement } from "../entities/StockMovement";
import { Product } from "../entities/Product";

const router = Router();
const repo = () => AppDataSource.getRepository(StockMovement);
const productRepo = () => AppDataSource.getRepository(Product);

// GET /api/stockMovements - list all movements
router.get("/", async (req: Request, res: Response) => {
  try {
    const { type, search } = req.query as { type?: string; search?: string };
    const qb = repo().createQueryBuilder("sm").orderBy("sm.createdAt", "DESC");
    if (type) qb.andWhere("sm.type = :type", { type });
    if (search) qb.andWhere("sm.productName ILIKE :s", { s: `%${search}%` });
    const movements = await qb.getMany();
    res.json({ success: true, data: movements });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/stockMovements/low-stock - products below threshold
router.get("/low-stock", async (req: Request, res: Response) => {
  try {
    const threshold = parseInt((req.query.threshold as string) || "100");
    const products = await productRepo()
      .createQueryBuilder("p")
      .where("p.currentStock < :t", { t: threshold })
      .orderBy("p.currentStock", "ASC")
      .getMany();
    res.json({ success: true, data: products });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/stockMovements - record a movement
router.post("/", async (req: Request, res: Response) => {
  try {
    const { productName, type, qty, refType, refNumber, note } = req.body;

    const product = await productRepo().findOne({ where: { name: productName } });
    if (product) {
      const qtyNum = parseFloat(qty);
      if (type === "in") {
        product.currentStock = parseFloat(product.currentStock as any) + qtyNum;
      } else if (type === "out") {
        product.currentStock = Math.max(0, parseFloat(product.currentStock as any) - qtyNum);
      } else if (type === "adjust") {
        product.currentStock = qtyNum;
      }
      await productRepo().save(product);
    }

    const movement = repo().create({ productName, type, qty, refType, refNumber, note });
    const saved = await repo().save(movement);
    res.status(201).json({ success: true, data: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
