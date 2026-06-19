import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Supplier } from "../entities/Supplier";

const router = Router();

// GET all suppliers with openBills and balanceDue aggregates
router.get("/", async (req, res) => {
  try {
    const suppliers = await AppDataSource.getRepository(Supplier)
      .createQueryBuilder("s")
      .leftJoin("purchases", "p", "p.supplierName = s.name AND p.status IN ('open','partial')")
      .select("s.*")
      .addSelect("COUNT(DISTINCT p.id)", "openBills")
      .addSelect("COALESCE(SUM(p.total - p.amountPaid), 0)", "balanceDue")
      .groupBy("s.id")
      .orderBy("s.createdAt", "DESC")
      .getRawMany();
    res.json({ success: true, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const supplier = await AppDataSource.getRepository(Supplier).findOne({ where: { id: req.params.id } });
    if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });
    res.json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.post("/", async (req, res) => {
  try {
    const supplier = AppDataSource.getRepository(Supplier).create({ ...req.body, isActive: true });
    const saved = await AppDataSource.getRepository(Supplier).save(supplier);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Supplier);
    const supplier = await repo.findOne({ where: { id: req.params.id } });
    if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });
    repo.merge(supplier, req.body);
    const updated = await repo.save(supplier);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// PATCH /:id/toggle — toggle isActive
router.patch("/:id/toggle", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Supplier);
    const supplier = await repo.findOne({ where: { id: req.params.id } });
    if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });
    supplier.isActive = !supplier.isActive;
    const updated = await repo.save(supplier);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Supplier);
    const supplier = await repo.findOne({ where: { id: req.params.id } });
    if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });
    await repo.remove(supplier);
    res.json({ success: true, message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
