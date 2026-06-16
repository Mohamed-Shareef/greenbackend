import { Router } from "express";
import { AppDataSource } from "../data-source";
import { PurchaseOrder } from "../entities/PurchaseOrder";
import { OrderItem } from "../entities/OrderItem";

const router = Router();

// GET all purchase orders with items
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

// GET single purchase order
router.get("/:id", async (req, res) => {
  try {
    const order = await AppDataSource.getRepository(PurchaseOrder).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });
    if (!order) {
      return res.status(404).json({ success: false, message: "Purchase order not found" });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// CREATE purchase order
router.post("/", async (req, res) => {
  try {
    const { poNumber, supplierName, date, items, total } = req.body;

    const order = new PurchaseOrder();
    order.poNumber = poNumber;
    order.supplierName = supplierName;
    order.date = new Date(date);
    order.total = total;
    order.items = items.map((item: any) => {
      const orderItem = new OrderItem();
      orderItem.productName = item.product;
      orderItem.quantity = item.qty;
      orderItem.unitPrice = item.rate;
      orderItem.amount = item.amount;
      return orderItem;
    });

    const savedOrder = await AppDataSource.getRepository(PurchaseOrder).save(order);
    res.status(201).json({ success: true, data: savedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// UPDATE purchase order
router.put("/:id", async (req, res) => {
  try {
    const { poNumber, supplierName, date, items, total } = req.body;

    const order = await AppDataSource.getRepository(PurchaseOrder).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Purchase order not found" });
    }

    order.poNumber = poNumber;
    order.supplierName = supplierName;
    order.date = new Date(date);
    order.total = total;

    // Delete old items
    if (order.items && order.items.length > 0) {
      await AppDataSource.getRepository(OrderItem).remove(order.items);
    }

    // Add new items
    order.items = items.map((item: any) => {
      const orderItem = new OrderItem();
      orderItem.productName = item.product;
      orderItem.quantity = item.qty;
      orderItem.unitPrice = item.rate;
      orderItem.amount = item.amount;
      return orderItem;
    });

    const updatedOrder = await AppDataSource.getRepository(PurchaseOrder).save(order);
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// DELETE purchase order
router.delete("/:id", async (req, res) => {
  try {
    const order = await AppDataSource.getRepository(PurchaseOrder).findOne({
      where: { id: req.params.id },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Purchase order not found" });
    }

    await AppDataSource.getRepository(PurchaseOrder).remove(order);
    res.json({ success: true, message: "Purchase order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
