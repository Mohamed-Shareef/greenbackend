import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Sale } from "../entities/Sale";
import { SaleItem } from "../entities/SaleItem";

const router = Router();

// GET all sales with items
router.get("/", async (req, res) => {
  try {
    const sales = await AppDataSource.getRepository(Sale).find({
      relations: ["items"],
      order: { createdAt: "DESC" },
    });
    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// GET single sale
router.get("/:id", async (req, res) => {
  try {
    const sale = await AppDataSource.getRepository(Sale).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });
    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }
    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// CREATE sale
router.post("/", async (req, res) => {
  try {
    const { invoiceNo, customerName, date, items, total } = req.body;

    const sale = new Sale();
    sale.invoiceNo = invoiceNo;
    sale.customerName = customerName;
    sale.date = new Date(date);
    sale.total = total;
    sale.items = items.map((item: any) => {
      const saleItem = new SaleItem();
      saleItem.productName = item.productName;
      saleItem.quantity = item.quantity;
      saleItem.unitPrice = item.unitPrice;
      saleItem.amount = item.amount;
      return saleItem;
    });

    const savedSale = await AppDataSource.getRepository(Sale).save(sale);
    res.status(201).json({ success: true, data: savedSale });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// UPDATE sale
router.put("/:id", async (req, res) => {
  try {
    const { invoiceNo, customerName, date, items, total } = req.body;

    const sale = await AppDataSource.getRepository(Sale).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });

    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }

    sale.invoiceNo = invoiceNo;
    sale.customerName = customerName;
    sale.date = new Date(date);
    sale.total = total;

    // Delete old items
    if (sale.items && sale.items.length > 0) {
      await AppDataSource.getRepository(SaleItem).remove(sale.items);
    }

    // Add new items
    sale.items = items.map((item: any) => {
      const saleItem = new SaleItem();
     saleItem.productName = item.productName; 
     saleItem.quantity = item.quantity;       
     saleItem.unitPrice = item.unitPrice;     
     saleItem.amount = item.amount;
      return saleItem;
    });

    const updatedSale = await AppDataSource.getRepository(Sale).save(sale);
    res.json({ success: true, data: updatedSale });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// DELETE sale
router.delete("/:id", async (req, res) => {
  try {
    const sale = await AppDataSource.getRepository(Sale).findOne({
      where: { id: req.params.id },
    });

    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }

    await AppDataSource.getRepository(Sale).remove(sale);
    res.json({ success: true, message: "Sale deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
