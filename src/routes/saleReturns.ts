import { Router } from "express";
import { AppDataSource } from "../data-source";
import { SaleReturn } from "../entities/SaleReturn";
import { SaleReturnItem } from "../entities/SaleReturnItem";

const router = Router();

// GET all sale returns with items
router.get("/", async (req, res) => {
  try {
    const returns = await AppDataSource.getRepository(SaleReturn).find({
      relations: ["items"],
      order: { createdAt: "DESC" },
    });
    res.json({ success: true, data: returns });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// GET single sale return
router.get("/:id", async (req, res) => {
  try {
    const saleReturn = await AppDataSource.getRepository(SaleReturn).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });
    if (!saleReturn) {
      return res.status(404).json({ success: false, message: "Sale return not found" });
    }
    res.json({ success: true, data: saleReturn });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// CREATE sale return
router.post("/", async (req, res) => {
  try {
    const { returnNo, customerName, date, items, total, reason } = req.body;

    const saleReturn = new SaleReturn();
    saleReturn.returnNo = returnNo;
    saleReturn.customerName = customerName;
    saleReturn.date = new Date(date);
    saleReturn.total = total;
    saleReturn.reason = reason;
    saleReturn.items = items.map((item: any) => {
      const returnItem = new SaleReturnItem();
      returnItem.productName = item.productName;
      returnItem.quantity = item.quantity;
      returnItem.unitPrice = item.unitPrice;
      returnItem.amount = item.amount;
      return returnItem;
    });

    const savedReturn = await AppDataSource.getRepository(SaleReturn).save(saleReturn);
    res.status(201).json({ success: true, data: savedReturn });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// UPDATE sale return
router.put("/:id", async (req, res) => {
  try {
    const { returnNo, customerName, date, items, total, reason } = req.body;

    const saleReturn = await AppDataSource.getRepository(SaleReturn).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });

    if (!saleReturn) {
      return res.status(404).json({ success: false, message: "Sale return not found" });
    }

    saleReturn.returnNo = returnNo;
    saleReturn.customerName = customerName;
    saleReturn.date = new Date(date);
    saleReturn.total = total;
    saleReturn.reason = reason;

    // Delete old items
    if (saleReturn.items && saleReturn.items.length > 0) {
      await AppDataSource.getRepository(SaleReturnItem).remove(saleReturn.items);
    }

    // Add new items
    saleReturn.items = items.map((item: any) => {
      const returnItem = new SaleReturnItem();
      returnItem.productName = item.product;
      returnItem.quantity = item.qty;
      returnItem.unitPrice = item.rate;
      returnItem.amount = item.amount;
      return returnItem;
    });

    const updatedReturn = await AppDataSource.getRepository(SaleReturn).save(saleReturn);
    res.json({ success: true, data: updatedReturn });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// DELETE sale return
router.delete("/:id", async (req, res) => {
  try {
    const saleReturn = await AppDataSource.getRepository(SaleReturn).findOne({
      where: { id: req.params.id },
    });

    if (!saleReturn) {
      return res.status(404).json({ success: false, message: "Sale return not found" });
    }

    await AppDataSource.getRepository(SaleReturn).remove(saleReturn);
    res.json({ success: true, message: "Sale return deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
