import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Purchase } from "../entities/Purchase";
import { PurchaseItem } from "../entities/PurchaseItem";

const router = Router();

// GET all purchases with items
router.get("/", async (req, res) => {
  try {
    const purchases = await AppDataSource.getRepository(Purchase).find({
      relations: ["items"],
      order: { createdAt: "DESC" },
    });
    res.json({ success: true, data: purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// GET single purchase
router.get("/:id", async (req, res) => {
  try {
    const purchase = await AppDataSource.getRepository(Purchase).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });
    if (!purchase) {
      return res.status(404).json({ success: false, message: "Purchase not found" });
    }
    res.json({ success: true, data: purchase });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// CREATE purchase
router.post("/", async (req, res) => {
  try {
    const { billNo, supplierName, date, items, total } = req.body;

    const purchase = new Purchase();
    purchase.billNo = billNo;
    purchase.supplierName = supplierName;
    purchase.date = new Date(date);
    purchase.total = total;
    purchase.items = items.map((item: any) => {
      const purchaseItem = new PurchaseItem();
      purchaseItem.productName = item.productName;
      purchaseItem.quantity = item.quantity;
      purchaseItem.unitPrice = item.unitPrice;
      purchaseItem.amount = item.amount;
      return purchaseItem;
    });

    const savedPurchase = await AppDataSource.getRepository(Purchase).save(purchase);
    res.status(201).json({ success: true, data: savedPurchase });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// UPDATE purchase
router.put("/:id", async (req, res) => {
  try {
    const { billNo, supplierName, date, items, total } = req.body;

    const purchase = await AppDataSource.getRepository(Purchase).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });

    if (!purchase) {
      return res.status(404).json({ success: false, message: "Purchase not found" });
    }

    purchase.billNo = billNo;
    purchase.supplierName = supplierName;
    purchase.date = new Date(date);
    purchase.total = total;

    // Delete old items
    if (purchase.items && purchase.items.length > 0) {
      await AppDataSource.getRepository(PurchaseItem).remove(purchase.items);
    }

    // Add new items
    purchase.items = items.map((item: any) => {
      const purchaseItem = new PurchaseItem();
      purchaseItem.productName = item.productName;
      purchaseItem.quantity = item.quantity;
      purchaseItem.unitPrice = item.unitPrice;
      purchaseItem.amount = item.amount;
      return purchaseItem;
    });

    const updatedPurchase = await AppDataSource.getRepository(Purchase).save(purchase);
    res.json({ success: true, data: updatedPurchase });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// DELETE purchase
router.delete("/:id", async (req, res) => {
  try {
    const purchase = await AppDataSource.getRepository(Purchase).findOne({
      where: { id: req.params.id },
    });

    if (!purchase) {
      return res.status(404).json({ success: false, message: "Purchase not found" });
    }

    await AppDataSource.getRepository(Purchase).remove(purchase);
    res.json({ success: true, message: "Purchase deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
