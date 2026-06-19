import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Client } from "../entities/Client";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const clients = await AppDataSource.getRepository(Client)
      .createQueryBuilder("c")
      .leftJoin("sales", "s", "s.customerName = c.name")
      .select("c.*")
      .addSelect("COUNT(DISTINCT s.id)", "orderCount")
      .addSelect("COALESCE(SUM(s.total), 0)", "totalSales")
      .groupBy("c.id")
      .orderBy("c.createdAt", "DESC")
      .getRawMany();
    res.json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const client = await AppDataSource.getRepository(Client).findOne({ where: { id: req.params.id } });
    if (!client) return res.status(404).json({ success: false, message: "Client not found" });
    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.post("/", async (req, res) => {
  try {
    const client = AppDataSource.getRepository(Client).create(req.body);
    const saved = await AppDataSource.getRepository(Client).save(client);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Client);
    const client = await repo.findOne({ where: { id: req.params.id } });
    if (!client) return res.status(404).json({ success: false, message: "Client not found" });
    repo.merge(client, req.body);
    const updated = await repo.save(client);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Client);
    const client = await repo.findOne({ where: { id: req.params.id } });
    if (!client) return res.status(404).json({ success: false, message: "Client not found" });
    await repo.remove(client);
    res.json({ success: true, message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
