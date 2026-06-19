import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const products = await AppDataSource.getRepository(Product).find({ order: { createdAt: "DESC" } });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await AppDataSource.getRepository(Product).findOne({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.post("/", async (req, res) => {
  try {
    const product = AppDataSource.getRepository(Product).create(req.body);
    const saved = await AppDataSource.getRepository(Product).save(product);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Product);
    const product = await repo.findOne({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    repo.merge(product, req.body);
    const updated = await repo.save(product);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Product);
    const product = await repo.findOne({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    await repo.remove(product);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
