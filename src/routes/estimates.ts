import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Estimate } from "../entities/Estimate";
import { EstimateItem } from "../entities/EstimateItem";
import { SalesOrder } from "../entities/SalesOrder";
import { SalesOrderItem } from "../entities/SalesOrderItem";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const estimates = await AppDataSource.getRepository(Estimate).find({
      relations: ["items"],
      order: { createdAt: "DESC" },
    });
    res.json({ success: true, data: estimates });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const estimate = await AppDataSource.getRepository(Estimate).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });
    if (!estimate) return res.status(404).json({ success: false, message: "Estimate not found" });
    res.json({ success: true, data: estimate });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { estimateNo, clientName, date, validTill, items, subtotal, gstAmount, total, status } = req.body;
    const estimate = new Estimate();
    estimate.estimateNo = estimateNo;
    estimate.clientName = clientName;
    estimate.date = new Date(date);
    estimate.validTill = validTill ? new Date(validTill) : null as any;
    estimate.subtotal = subtotal || 0;
    estimate.gstAmount = gstAmount || 0;
    estimate.total = total;
    estimate.status = status || "draft";
    estimate.items = (items || []).map((item: any) => {
      const ei = new EstimateItem();
      ei.productName = item.productName;
      ei.quantity = item.quantity;
      ei.unitPrice = item.unitPrice;
      ei.gstRate = item.gstRate || 0;
      ei.amount = item.amount;
      return ei;
    });
    const saved = await AppDataSource.getRepository(Estimate).save(estimate);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Estimate);
    const estimate = await repo.findOne({ where: { id: req.params.id }, relations: ["items"] });
    if (!estimate) return res.status(404).json({ success: false, message: "Estimate not found" });
    const { items, ...rest } = req.body;
    repo.merge(estimate, rest);
    if (estimate.items?.length) await AppDataSource.getRepository(EstimateItem).remove(estimate.items);
    estimate.items = (items || []).map((item: any) => {
      const ei = new EstimateItem();
      ei.productName = item.productName;
      ei.quantity = item.quantity;
      ei.unitPrice = item.unitPrice;
      ei.gstRate = item.gstRate || 0;
      ei.amount = item.amount;
      return ei;
    });
    const updated = await repo.save(estimate);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// POST /:id/convert — convert estimate to sales order
router.post("/:id/convert", async (req, res) => {
  try {
    const estimate = await AppDataSource.getRepository(Estimate).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });
    if (!estimate) return res.status(404).json({ success: false, message: "Estimate not found" });

    const so = new SalesOrder();
    so.soNumber = `SO-${Date.now()}`;
    so.clientName = estimate.clientName;
    so.date = new Date();
    so.subtotal = estimate.subtotal;
    so.gstAmount = estimate.gstAmount;
    so.total = estimate.total;
    so.status = "pending";
    so.items = estimate.items.map((ei) => {
      const soi = new SalesOrderItem();
      soi.productName = ei.productName;
      soi.quantity = ei.quantity;
      soi.unitPrice = ei.unitPrice;
      soi.gstRate = ei.gstRate;
      soi.amount = ei.amount;
      return soi;
    });
    const savedSO = await AppDataSource.getRepository(SalesOrder).save(so);

    estimate.soId = savedSO.id;
    estimate.status = "accepted";
    await AppDataSource.getRepository(Estimate).save(estimate);

    res.status(201).json({ success: true, data: savedSO });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Estimate);
    const estimate = await repo.findOne({ where: { id: req.params.id } });
    if (!estimate) return res.status(404).json({ success: false, message: "Estimate not found" });
    await repo.remove(estimate);
    res.json({ success: true, message: "Estimate deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
