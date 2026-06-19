import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { BankTransaction } from "../entities/BankTransaction";
import { BankAccount } from "../entities/BankAccount";

const router = Router();
const txnRepo = () => AppDataSource.getRepository(BankTransaction);
const accRepo = () => AppDataSource.getRepository(BankAccount);

// GET /api/bankTransactions
router.get("/", async (req: Request, res: Response) => {
  try {
    const { bankAccountId, type } = req.query as { bankAccountId?: string; type?: string };
    const qb = txnRepo().createQueryBuilder("bt").orderBy("bt.txnDate", "DESC").addOrderBy("bt.createdAt", "DESC");
    if (bankAccountId) qb.andWhere("bt.bankAccountId = :id", { id: bankAccountId });
    if (type) qb.andWhere("bt.type = :type", { type });
    const txns = await qb.getMany();
    res.json({ success: true, data: txns });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bankTransactions
router.post("/", async (req: Request, res: Response) => {
  try {
    const { bankAccountId, type, amount, description, chequeNumber, txnDate } = req.body;
    const amt = parseFloat(amount);

    const account = await accRepo().findOne({ where: { id: bankAccountId } });
    if (!account) return res.status(404).json({ success: false, error: "Bank account not found" });

    if (type === "credit") {
      account.currentBalance = parseFloat(account.currentBalance as any) + amt;
    } else {
      account.currentBalance = parseFloat(account.currentBalance as any) - amt;
    }
    await accRepo().save(account);

    const txn = txnRepo().create({ bankAccountId, type, amount: amt, description, chequeNumber, txnDate, isReconciled: false });
    const saved = await txnRepo().save(txn);
    res.status(201).json({ success: true, data: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/bankTransactions/:id/reconcile
router.patch("/:id/reconcile", async (req: Request, res: Response) => {
  try {
    const txn = await txnRepo().findOne({ where: { id: req.params.id } });
    if (!txn) return res.status(404).json({ success: false, error: "Not found" });
    txn.isReconciled = !txn.isReconciled;
    const saved = await txnRepo().save(txn);
    res.json({ success: true, data: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
