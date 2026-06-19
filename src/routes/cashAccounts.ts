import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { CashAccount } from "../entities/CashAccount";

const router = Router();
const repo = () => AppDataSource.getRepository(CashAccount);

// GET /api/cashAccounts
router.get("/", async (_req: Request, res: Response) => {
  try {
    const accounts = await repo().find({ order: { createdAt: "ASC" } });
    res.json({ success: true, data: accounts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/cashAccounts
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const account = repo().create({ name, balance: 0, totalIn: 0, totalOut: 0 });
    const saved = await repo().save(account);
    res.status(201).json({ success: true, data: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/cashAccounts/:id
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const account = await repo().findOne({ where: { id: req.params.id } });
    if (!account) return res.status(404).json({ success: false, error: "Not found" });
    if (req.body.name) account.name = req.body.name;
    const saved = await repo().save(account);
    res.json({ success: true, data: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
