import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Stock } from "../entities/Stock";

const router = Router();

// GET all stock items
router.get("/", async (req, res) => {
  try {
    const stock = await AppDataSource.getRepository(Stock).find({
      order: { createdAt: "DESC" },
    });
    res.json({ success: true, data: stock });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// GET single stock item
router.get("/:id", async (req, res) => {
  try {
    const item = await AppDataSource.getRepository(Stock).findOne({
      where: { id: req.params.id },
    });
    if (!item) {
      return res.status(404).json({ success: false, message: "Stock item not found" });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// CREATE stock item
router.post("/", async (req, res) => {
  try {
    const { itemName, category, quantity, unitPrice, totalValue } = req.body;

    const stock = new Stock();
    stock.itemName = itemName;
    stock.category = category;
    stock.quantity = quantity;
    stock.unitPrice = unitPrice;
    
    stock.totalValue = stock.quantity * stock.unitPrice;

    const savedStock = await AppDataSource.getRepository(Stock).save(stock);
    res.status(201).json({ success: true, data: savedStock });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// UPDATE stock item
router.put("/:id", async (req, res) => {
  try {
    const { itemName, category, quantity, unitPrice, totalValue } = req.body;

    const stock = await AppDataSource.getRepository(Stock).findOne({
      where: { id: req.params.id },
    });

    if (!stock) {
      return res.status(404).json({ success: false, message: "Stock item not found" });
    }

    stock.itemName = itemName;
    stock.category = category;
    stock.quantity = quantity;
    stock.unitPrice = unitPrice;
    stock.totalValue = totalValue;

    const updatedStock = await AppDataSource.getRepository(Stock).save(stock);
    res.json({ success: true, data: updatedStock });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// DELETE stock item
router.delete("/:id", async (req, res) => {
  try {
    const stock = await AppDataSource.getRepository(Stock).findOne({
      where: { id: req.params.id },
    });

    if (!stock) {
      return res.status(404).json({ success: false, message: "Stock item not found" });
    }

    await AppDataSource.getRepository(Stock).remove(stock);
    res.json({ success: true, message: "Stock item deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
