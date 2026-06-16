import { Router } from "express";
import { AppDataSource } from "../data-source";
import { PurchaseReturn } from "../entities/PurchaseReturn";
import { PurchaseReturnItem } from "../entities/PurchaseReturnItem";

const router = Router();

// GET all purchase returns with items
router.get("/", async (req, res) => {
  try {
    const returns = await AppDataSource.getRepository(PurchaseReturn).find({
      relations: ["items"],
      order: { createdAt: "DESC" },
    });
    res.json({ success: true, data: returns });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// GET single purchase return
router.get("/:id", async (req, res) => {
  try {
    const purchaseReturn = await AppDataSource.getRepository(PurchaseReturn).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });
    if (!purchaseReturn) {
      return res.status(404).json({ success: false, message: "Purchase return not found" });
    }
    res.json({ success: true, data: purchaseReturn });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// CREATE purchase return
router.post("/", async (req, res) => {
  try {
    const { returnNo, supplierName, date, items, total, reason } = req.body;

    const purchaseReturn = new PurchaseReturn();
    purchaseReturn.returnNo = returnNo;
    purchaseReturn.supplierName = supplierName;
    purchaseReturn.date = new Date(date);
    purchaseReturn.total = total;
    purchaseReturn.reason = reason;
    purchaseReturn.items = items.map((item: any) => {
      const returnItem = new PurchaseReturnItem();
      returnItem.productName = item.productName;
      returnItem.quantity = item.quantity;
      returnItem.unitPrice = item.unitPrice;
      returnItem.amount = item.amount;
      return returnItem;
    });

    const savedReturn = await AppDataSource.getRepository(PurchaseReturn).save(purchaseReturn);
    res.status(201).json({ success: true, data: savedReturn });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// UPDATE purchase return
router.put("/:id", async (req, res) => {
  try {
    const { returnNo, supplierName, date, items, total, reason } = req.body;

    const purchaseReturn = await AppDataSource.getRepository(PurchaseReturn).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });

    if (!purchaseReturn) {
      return res.status(404).json({ success: false, message: "Purchase return not found" });
    }

    purchaseReturn.returnNo = returnNo;
    purchaseReturn.supplierName = supplierName;
    purchaseReturn.date = new Date(date);
    purchaseReturn.total = total;
    purchaseReturn.reason = reason;

    // Delete old items
    if (purchaseReturn.items && purchaseReturn.items.length > 0) {
      await AppDataSource.getRepository(PurchaseReturnItem).remove(purchaseReturn.items);
    }

    // Add new items
    purchaseReturn.items = items.map((item: any) => {
      const returnItem = new PurchaseReturnItem();
      returnItem.productName = item.product;
      returnItem.quantity = item.qty;
      returnItem.unitPrice = item.rate;
      returnItem.amount = item.amount;
      return returnItem;
    });

    const updatedReturn = await AppDataSource.getRepository(PurchaseReturn).save(purchaseReturn);
    res.json({ success: true, data: updatedReturn });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// DELETE purchase return
router.delete("/:id", async (req, res) => {
  try {
    const purchaseReturn = await AppDataSource.getRepository(PurchaseReturn).findOne({
      where: { id: req.params.id },
    });

    if (!purchaseReturn) {
      return res.status(404).json({ success: false, message: "Purchase return not found" });
    }

    await AppDataSource.getRepository(PurchaseReturn).remove(purchaseReturn);
    res.json({ success: true, message: "Purchase return deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
