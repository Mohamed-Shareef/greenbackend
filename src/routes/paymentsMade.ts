import { Router } from "express";
import { AppDataSource } from "../data-source";
import { PaymentMade } from "../entities/PaymentMade";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const payments = await AppDataSource.getRepository(PaymentMade).find({ order: { createdAt: "DESC" } });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const payment = await AppDataSource.getRepository(PaymentMade).findOne({ where: { id: req.params.id } });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.post("/", async (req, res) => {
  try {
    const payment = AppDataSource.getRepository(PaymentMade).create(req.body);
    const saved = await AppDataSource.getRepository(PaymentMade).save(payment);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(PaymentMade);
    const payment = await repo.findOne({ where: { id: req.params.id } });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    repo.merge(payment, req.body);
    const updated = await repo.save(payment);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(PaymentMade);
    const payment = await repo.findOne({ where: { id: req.params.id } });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    await repo.remove(payment);
    res.json({ success: true, message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
