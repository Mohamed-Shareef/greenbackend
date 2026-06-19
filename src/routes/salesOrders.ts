import { Router } from "express";
import { AppDataSource } from "../data-source";
import { SalesOrder } from "../entities/SalesOrder";
import { SalesOrderItem } from "../entities/SalesOrderItem";
import { Delivery } from "../entities/Delivery";
import { DeliveryItem } from "../entities/DeliveryItem";
import { Product } from "../entities/Product";
import { StockMovement } from "../entities/StockMovement";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const orders = await AppDataSource.getRepository(SalesOrder).find({
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
    const order = await AppDataSource.getRepository(SalesOrder).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });
    if (!order) return res.status(404).json({ success: false, message: "Sales order not found" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { soNumber, clientName, date, deliveryDate, items, subtotal, gstAmount, total, status } = req.body;
    const order = new SalesOrder();
    order.soNumber = soNumber;
    order.clientName = clientName;
    order.date = new Date(date);
    order.deliveryDate = deliveryDate ? new Date(deliveryDate) : null as any;
    order.subtotal = subtotal || 0;
    order.gstAmount = gstAmount || 0;
    order.total = total;
    order.status = status || "pending";
    order.items = (items || []).map((item: any) => {
      const soi = new SalesOrderItem();
      soi.productName = item.productName;
      soi.quantity = item.quantity;
      soi.unitPrice = item.unitPrice;
      soi.gstRate = item.gstRate || 0;
      soi.amount = item.amount;
      return soi;
    });
    const saved = await AppDataSource.getRepository(SalesOrder).save(order);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(SalesOrder);
    const order = await repo.findOne({ where: { id: req.params.id }, relations: ["items"] });
    if (!order) return res.status(404).json({ success: false, message: "Sales order not found" });
    const { items, ...rest } = req.body;
    repo.merge(order, rest);
    if (order.items?.length) await AppDataSource.getRepository(SalesOrderItem).remove(order.items);
    order.items = (items || []).map((item: any) => {
      const soi = new SalesOrderItem();
      soi.productName = item.productName;
      soi.quantity = item.quantity;
      soi.unitPrice = item.unitPrice;
      soi.gstRate = item.gstRate || 0;
      soi.amount = item.amount;
      return soi;
    });
    const updated = await repo.save(order);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// POST /:id/dispatch — deduct stock, create delivery note
router.post("/:id/dispatch", async (req, res) => {
  try {
    const order = await AppDataSource.getRepository(SalesOrder).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });
    if (!order) return res.status(404).json({ success: false, message: "Sales order not found" });
    if (order.status !== "pending") return res.status(400).json({ success: false, message: "Only pending orders can be dispatched" });

    const productRepo = AppDataSource.getRepository(Product);
    const movRepo = AppDataSource.getRepository(StockMovement);

    // Deduct stock and create movements
    for (const item of order.items) {
      const product = await productRepo.findOne({ where: { name: item.productName } });
      if (product) {
        product.currentStock = Math.max(0, parseFloat(product.currentStock as any) - parseFloat(item.quantity as any));
        await productRepo.save(product);
      }
      await movRepo.save(movRepo.create({
        productName: item.productName,
        type: "out",
        qty: item.quantity,
        refType: "so",
        refNumber: order.soNumber,
      }));
    }

    // Create delivery note
    const dnRepo = AppDataSource.getRepository(Delivery);
    const diRepo = AppDataSource.getRepository(DeliveryItem);
    const dn = new Delivery();
    dn.deliveryNo = `DN-${Date.now()}`;
    dn.clientName = order.clientName;
    dn.salesOrderNo = order.soNumber;
    dn.date = new Date();
    dn.status = "pending";
    dn.items = order.items.map((item) => {
      const di = new DeliveryItem();
      di.productName = item.productName;
      di.quantity = item.quantity;
      di.unit = "Nos";
      return di;
    });
    await dnRepo.save(dn);

    order.status = "dispatched";
    const updated = await AppDataSource.getRepository(SalesOrder).save(order);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(SalesOrder);
    const order = await repo.findOne({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ success: false, message: "Sales order not found" });
    await repo.remove(order);
    res.json({ success: true, message: "Sales order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
