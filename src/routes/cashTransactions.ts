import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { CashTransaction } from "../entities/CashTransaction";
import { CashAccount } from "../entities/CashAccount";

const router = Router();
const txnRepo = () => AppDataSource.getRepository(CashTransaction);
const accRepo = () => AppDataSource.getRepository(CashAccount);

// GET /api/cashTransactions
router.get("/", async (req: Request, res: Response) => {
  try {
    const { cashAccountId, type } = req.query as { cashAccountId?: string; type?: string };
    const qb = txnRepo().createQueryBuilder("ct").orderBy("ct.txnDate", "DESC").addOrderBy("ct.createdAt", "DESC");
    if (cashAccountId) qb.andWhere("ct.cashAccountId = :id", { id: cashAccountId });
    if (type) qb.andWhere("ct.type = :type", { type });
    const txns = await qb.getMany();
    res.json({ success: true, data: txns });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/cashTransactions/daily-summary/:accountId
router.get("/daily-summary/:accountId", async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const rows = await txnRepo()
      .createQueryBuilder("ct")
      .select("ct.txnDate::date", "date")
      .addSelect(`SUM(CASE WHEN ct.type = 'in' THEN ct.amount ELSE 0 END)`, "cashIn")
      .addSelect(`SUM(CASE WHEN ct.type = 'out' THEN ct.amount ELSE 0 END)`, "cashOut")
      .where("ct.cashAccountId = :id", { id: accountId })
      .andWhere("ct.txnDate >= CURRENT_DATE - INTERVAL '30 days'")
      .groupBy("ct.txnDate::date")
      .orderBy("ct.txnDate::date", "DESC")
      .getRawMany();
    res.json({ success: true, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/cashTransactions
router.post("/", async (req: Request, res: Response) => {
  try {
    const { cashAccountId, type, amount, category, description, txnDate } = req.body;
    const amt = parseFloat(amount);

    const account = await accRepo().findOne({ where: { id: cashAccountId } });
    if (!account) return res.status(404).json({ success: false, error: "Cash account not found" });

    if (type === "in") {
      account.balance = parseFloat(account.balance as any) + amt;
      account.totalIn = parseFloat(account.totalIn as any) + amt;
    } else {
      account.balance = parseFloat(account.balance as any) - amt;
      account.totalOut = parseFloat(account.totalOut as any) + amt;
    }
    await accRepo().save(account);

    const refNumber = `CT-${Date.now()}`;
    const txn = txnRepo().create({ cashAccountId, type, amount: amt, category, description, refNumber, txnDate });
    const saved = await txnRepo().save(txn);
    res.status(201).json({ success: true, data: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
