import { Router } from "express";
import { AppDataSource } from "../data-source";
import { CashBook } from "../entities/CashBook";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const entries = await AppDataSource.getRepository(CashBook).find({ order: { date: "DESC", createdAt: "DESC" } });
    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const entry = await AppDataSource.getRepository(CashBook).findOne({ where: { id: req.params.id } });
    if (!entry) return res.status(404).json({ success: false, message: "Entry not found" });
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.post("/", async (req, res) => {
  try {
    const entry = AppDataSource.getRepository(CashBook).create(req.body);
    const saved = await AppDataSource.getRepository(CashBook).save(entry);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(CashBook);
    const entry = await repo.findOne({ where: { id: req.params.id } });
    if (!entry) return res.status(404).json({ success: false, message: "Entry not found" });
    repo.merge(entry, req.body);
    const updated = await repo.save(entry);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(CashBook);
    const entry = await repo.findOne({ where: { id: req.params.id } });
    if (!entry) return res.status(404).json({ success: false, message: "Entry not found" });
    await repo.remove(entry);
    res.json({ success: true, message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
