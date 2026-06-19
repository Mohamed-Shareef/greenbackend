import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Purchase } from "../entities/Purchase";
import { PurchaseItem } from "../entities/PurchaseItem";
import { BillPayment } from "../entities/BillPayment";

const router = Router();

// GET summary stats
router.get("/summary", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Purchase);
    const [open, partial, paid, totalDue] = await Promise.all([
      repo.count({ where: { status: "open" } }),
      repo.count({ where: { status: "partial" } }),
      repo.count({ where: { status: "paid" } }),
      repo.createQueryBuilder("p")
        .select("COALESCE(SUM(p.total - p.amountPaid), 0)", "outstanding")
        .where("p.status IN ('open', 'partial')")
        .getRawOne(),
    ]);
    res.json({ success: true, data: { open, partial, paid, outstanding: parseFloat(totalDue?.outstanding || "0") } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.get("/", async (req, res) => {
  try {
    const purchases = await AppDataSource.getRepository(Purchase).find({
      relations: ["items"],
      order: { createdAt: "DESC" },
    });
    res.json({ success: true, data: purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const purchase = await AppDataSource.getRepository(Purchase).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });
    if (!purchase) return res.status(404).json({ success: false, message: "Purchase not found" });
    const payments = await AppDataSource.getRepository(BillPayment).find({ where: { purchaseId: req.params.id }, order: { createdAt: "DESC" } });
    res.json({ success: true, data: { ...purchase, payments } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { billNo, supplierName, date, items, subtotal, gstAmount, cgst, sgst, igst, total, dueDate, status, poId, placeOfSupply, gstType, discount } = req.body;
    const purchase = new Purchase();
    purchase.billNo = billNo;
    purchase.supplierName = supplierName;
    purchase.date = new Date(date);
    purchase.subtotal = subtotal || 0;
    purchase.gstAmount = gstAmount || 0;
    purchase.cgst = cgst || 0;
    purchase.sgst = sgst || 0;
    purchase.igst = igst || 0;
    purchase.discount = discount || 0;
    purchase.total = total;
    purchase.amountPaid = 0;
    purchase.status = status || "open";
    purchase.dueDate = dueDate ? new Date(dueDate) : null as any;
    purchase.poId = poId || null as any;
    purchase.placeOfSupply = placeOfSupply || null as any;
    purchase.gstType = gstType || "intrastate";
    purchase.items = (items || []).map((item: any) => {
      const pi = new PurchaseItem();
      pi.productName = item.productName;
      pi.quantity = item.quantity;
      pi.unitPrice = item.unitPrice;
      pi.discount = item.discount || 0;
      pi.gstRate = item.gstRate || 0;
      pi.gstAmount = item.gstAmount || 0;
      pi.amount = item.amount;
      return pi;
    });
    const saved = await AppDataSource.getRepository(Purchase).save(purchase);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const purchase = await AppDataSource.getRepository(Purchase).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });
    if (!purchase) return res.status(404).json({ success: false, message: "Purchase not found" });
    const { items, ...rest } = req.body;
    AppDataSource.getRepository(Purchase).merge(purchase, rest);
    if (purchase.items?.length) await AppDataSource.getRepository(PurchaseItem).remove(purchase.items);
    purchase.items = (items || []).map((item: any) => {
      const pi = new PurchaseItem();
      pi.productName = item.productName;
      pi.quantity = item.quantity;
      pi.unitPrice = item.unitPrice;
      pi.discount = item.discount || 0;
      pi.gstRate = item.gstRate || 0;
      pi.gstAmount = item.gstAmount || 0;
      pi.amount = item.amount;
      return pi;
    });
    const updated = await AppDataSource.getRepository(Purchase).save(purchase);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// POST /:id/payments — record a payment against a bill
router.post("/:id/payments", async (req, res) => {
  try {
    const purchase = await AppDataSource.getRepository(Purchase).findOne({ where: { id: req.params.id } });
    if (!purchase) return res.status(404).json({ success: false, message: "Purchase not found" });

    const { amount, paymentMode, reference, date } = req.body;
    const amt = parseFloat(amount);

    const payment = AppDataSource.getRepository(BillPayment).create({
      purchaseId: req.params.id,
      amount: amt,
      paymentMode: paymentMode || "cash",
      reference,
      date: new Date(date || new Date()),
    });
    await AppDataSource.getRepository(BillPayment).save(payment);

    purchase.amountPaid = parseFloat(purchase.amountPaid as any) + amt;
    const balance = parseFloat(purchase.total as any) - parseFloat(purchase.amountPaid as any);
    if (balance <= 0) purchase.status = "paid";
    else if (parseFloat(purchase.amountPaid as any) > 0) purchase.status = "partial";
    await AppDataSource.getRepository(Purchase).save(purchase);

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const purchase = await AppDataSource.getRepository(Purchase).findOne({ where: { id: req.params.id } });
    if (!purchase) return res.status(404).json({ success: false, message: "Purchase not found" });
    await AppDataSource.getRepository(Purchase).remove(purchase);
    res.json({ success: true, message: "Purchase deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
