import { Router } from "express";
import { AppDataSource } from "../data-source";
import { PurchaseOrder } from "../entities/PurchaseOrder";
import { OrderItem } from "../entities/OrderItem";
import { Product } from "../entities/Product";
import { StockMovement } from "../entities/StockMovement";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const orders = await AppDataSource.getRepository(PurchaseOrder).find({
      relations: ["items"],
      order: { createdAt: "DESC" },
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const order = await AppDataSource.getRepository(PurchaseOrder).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });
    if (!order) return res.status(404).json({ success: false, message: "Purchase order not found" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { poNumber, supplierName, date, items, total, status } = req.body;
    const order = new PurchaseOrder();
    order.poNumber = poNumber;
    order.supplierName = supplierName;
    order.date = new Date(date);
    order.total = total;
    order.status = status || "pending";
    order.items = items.map((item: any) => {
      const orderItem = new OrderItem();
      orderItem.productName = item.product || item.productName;
      orderItem.quantity = item.qty || item.quantity;
      orderItem.unitPrice = item.rate || item.unitPrice;
      orderItem.amount = item.amount;
      return orderItem;
    });
    const saved = await AppDataSource.getRepository(PurchaseOrder).save(order);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { poNumber, supplierName, date, items, total, status } = req.body;
    const order = await AppDataSource.getRepository(PurchaseOrder).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });
    if (!order) return res.status(404).json({ success: false, message: "Purchase order not found" });
    order.poNumber = poNumber;
    order.supplierName = supplierName;
    order.date = new Date(date);
    order.total = total;
    if (status) order.status = status;
    if (order.items?.length) await AppDataSource.getRepository(OrderItem).remove(order.items);
    order.items = items.map((item: any) => {
      const orderItem = new OrderItem();
      orderItem.productName = item.product || item.productName;
      orderItem.quantity = item.qty || item.quantity;
      orderItem.unitPrice = item.rate || item.unitPrice;
      orderItem.amount = item.amount;
      return orderItem;
    });
    const updated = await AppDataSource.getRepository(PurchaseOrder).save(order);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// POST /:id/receive — receive PO, increment stock, create movements
router.post("/:id/receive", async (req, res) => {
  try {
    const order = await AppDataSource.getRepository(PurchaseOrder).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });
    if (!order) return res.status(404).json({ success: false, message: "Purchase order not found" });
    if (order.status === "received") return res.status(400).json({ success: false, message: "Already received" });

    const productRepo = AppDataSource.getRepository(Product);
    const movRepo = AppDataSource.getRepository(StockMovement);

    for (const item of order.items) {
      const product = await productRepo.findOne({ where: { name: item.productName } });
      if (product) {
        product.currentStock = parseFloat(product.currentStock as any) + parseFloat(item.quantity as any);
        await productRepo.save(product);
      }
      const mov = movRepo.create({
        productName: item.productName,
        type: "in",
        qty: item.quantity,
        refType: "po",
        refNumber: order.poNumber,
      });
      await movRepo.save(mov);
    }

    order.status = "received";
    const updated = await AppDataSource.getRepository(PurchaseOrder).save(order);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const order = await AppDataSource.getRepository(PurchaseOrder).findOne({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ success: false, message: "Purchase order not found" });
    await AppDataSource.getRepository(PurchaseOrder).remove(order);
    res.json({ success: true, message: "Purchase order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
