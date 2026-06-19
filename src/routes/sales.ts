import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Sale } from "../entities/Sale";
import { SaleItem } from "../entities/SaleItem";
import { InvoicePayment } from "../entities/InvoicePayment";

const router = Router();

// GET summary stats
router.get("/summary", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Sale);
    const [unpaid, partial, paid, outstanding] = await Promise.all([
      repo.count({ where: { status: "unpaid" } }),
      repo.count({ where: { status: "partial" } }),
      repo.count({ where: { status: "paid" } }),
      repo.createQueryBuilder("s")
        .select("COALESCE(SUM(s.total - s.amountPaid), 0)", "outstanding")
        .where("s.status IN ('unpaid', 'partial')")
        .getRawOne(),
    ]);
    res.json({ success: true, data: { unpaid, partial, paid, outstanding: parseFloat(outstanding?.outstanding || "0") } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.get("/", async (req, res) => {
  try {
    const sales = await AppDataSource.getRepository(Sale).find({
      relations: ["items"],
      order: { createdAt: "DESC" },
    });
    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const sale = await AppDataSource.getRepository(Sale).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });
    if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });
    const payments = await AppDataSource.getRepository(InvoicePayment).find({ where: { saleId: req.params.id }, order: { createdAt: "DESC" } });
    res.json({ success: true, data: { ...sale, payments } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { invoiceNo, customerName, date, items, subtotal, gstAmount, total, dueDate, status } = req.body;
    const sale = new Sale();
    sale.invoiceNo = invoiceNo;
    sale.customerName = customerName;
    sale.date = new Date(date);
    sale.subtotal = subtotal || 0;
    sale.gstAmount = gstAmount || 0;
    sale.total = total;
    sale.amountPaid = 0;
    sale.status = status || "unpaid";
    sale.dueDate = dueDate ? new Date(dueDate) : null as any;
    sale.items = (items || []).map((item: any) => {
      const si = new SaleItem();
      si.productName = item.productName;
      si.quantity = item.quantity;
      si.unitPrice = item.unitPrice;
      si.gstRate = item.gstRate || 0;
      si.gstAmount = item.gstAmount || 0;
      si.amount = item.amount;
      return si;
    });
    const saved = await AppDataSource.getRepository(Sale).save(sale);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const sale = await AppDataSource.getRepository(Sale).findOne({
      where: { id: req.params.id },
      relations: ["items"],
    });
    if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });
    const { items, ...rest } = req.body;
    AppDataSource.getRepository(Sale).merge(sale, rest);
    if (sale.items?.length) await AppDataSource.getRepository(SaleItem).remove(sale.items);
    sale.items = (items || []).map((item: any) => {
      const si = new SaleItem();
      si.productName = item.productName;
      si.quantity = item.quantity;
      si.unitPrice = item.unitPrice;
      si.gstRate = item.gstRate || 0;
      si.gstAmount = item.gstAmount || 0;
      si.amount = item.amount;
      return si;
    });
    const updated = await AppDataSource.getRepository(Sale).save(sale);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// POST /:id/payments — record a payment against an invoice
router.post("/:id/payments", async (req, res) => {
  try {
    const sale = await AppDataSource.getRepository(Sale).findOne({ where: { id: req.params.id } });
    if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });

    const { amount, paymentMode, reference, date } = req.body;
    const amt = parseFloat(amount);

    const payment = AppDataSource.getRepository(InvoicePayment).create({
      saleId: req.params.id,
      amount: amt,
      paymentMode: paymentMode || "cash",
      reference,
      date: new Date(date || new Date()),
    });
    await AppDataSource.getRepository(InvoicePayment).save(payment);

    sale.amountPaid = parseFloat(sale.amountPaid as any) + amt;
    const balance = parseFloat(sale.total as any) - parseFloat(sale.amountPaid as any);
    if (balance <= 0) sale.status = "paid";
    else if (parseFloat(sale.amountPaid as any) > 0) sale.status = "partial";
    await AppDataSource.getRepository(Sale).save(sale);

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const sale = await AppDataSource.getRepository(Sale).findOne({ where: { id: req.params.id } });
    if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });
    await AppDataSource.getRepository(Sale).remove(sale);
    res.json({ success: true, message: "Sale deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
