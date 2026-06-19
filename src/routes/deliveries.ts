import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Delivery } from "../entities/Delivery";
import { DeliveryItem } from "../entities/DeliveryItem";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const deliveries = await AppDataSource.getRepository(Delivery).find({
      relations: ["items"],
      order: { createdAt: "DESC" },
    });
    res.json({ success: true, data: deliveries });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const delivery = await AppDataSource.getRepository(Delivery).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });
    if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });
    res.json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { deliveryNo, clientName, salesOrderNo, date, shippingAddress, items, status, driverName, vehicleNo } = req.body;
    const delivery = new Delivery();
    delivery.deliveryNo = deliveryNo;
    delivery.clientName = clientName;
    delivery.salesOrderNo = salesOrderNo;
    delivery.date = new Date(date);
    delivery.shippingAddress = shippingAddress;
    delivery.status = status || "pending";
    delivery.driverName = driverName;
    delivery.vehicleNo = vehicleNo;
    delivery.items = (items || []).map((item: any) => {
      const di = new DeliveryItem();
      di.productName = item.productName;
      di.quantity = item.quantity;
      di.unit = item.unit || "Nos";
      return di;
    });
    const saved = await AppDataSource.getRepository(Delivery).save(delivery);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Delivery);
    const delivery = await repo.findOne({ where: { id: req.params.id }, relations: ["items"] });
    if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });
    const { items, ...rest } = req.body;
    repo.merge(delivery, rest);
    if (delivery.items?.length) await AppDataSource.getRepository(DeliveryItem).remove(delivery.items);
    delivery.items = (items || []).map((item: any) => {
      const di = new DeliveryItem();
      di.productName = item.productName;
      di.quantity = item.quantity;
      di.unit = item.unit || "Nos";
      return di;
    });
    const updated = await repo.save(delivery);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// POST /:id/assign-driver
router.post("/:id/assign-driver", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Delivery);
    const delivery = await repo.findOne({ where: { id: req.params.id } });
    if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });
    delivery.driverName = req.body.driverName;
    delivery.vehicleNo = req.body.vehicleNo;
    delivery.status = "in_transit";
    const updated = await repo.save(delivery);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// POST /:id/delivered
router.post("/:id/delivered", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Delivery);
    const delivery = await repo.findOne({ where: { id: req.params.id } });
    if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });
    delivery.status = "delivered";
    const updated = await repo.save(delivery);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Delivery);
    const delivery = await repo.findOne({ where: { id: req.params.id } });
    if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });
    await repo.remove(delivery);
    res.json({ success: true, message: "Delivery deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
