import { Router } from "express";
import { AppDataSource } from "../data-source";
import { BankAccount } from "../entities/BankAccount";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const accounts = await AppDataSource.getRepository(BankAccount).find({ order: { createdAt: "DESC" } });
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const account = await AppDataSource.getRepository(BankAccount).findOne({ where: { id: req.params.id } });
    if (!account) return res.status(404).json({ success: false, message: "Bank account not found" });
    res.json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.post("/", async (req, res) => {
  try {
    const account = AppDataSource.getRepository(BankAccount).create(req.body);
    const saved = await AppDataSource.getRepository(BankAccount).save(account);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(BankAccount);
    const account = await repo.findOne({ where: { id: req.params.id } });
    if (!account) return res.status(404).json({ success: false, message: "Bank account not found" });
    repo.merge(account, req.body);
    const updated = await repo.save(account);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(BankAccount);
    const account = await repo.findOne({ where: { id: req.params.id } });
    if (!account) return res.status(404).json({ success: false, message: "Bank account not found" });
    await repo.remove(account);
    res.json({ success: true, message: "Bank account deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
