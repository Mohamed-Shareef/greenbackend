import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Tenant } from "../entities/Tenant";
import { authenticate, AuthRequest, requireRole } from "../middleware/auth";

const router = Router();

router.use(authenticate);

// GET current tenant settings
router.get("/me", async (req: AuthRequest, res) => {
  try {
    const tenant = await AppDataSource.getRepository(Tenant).findOne({
      where: { id: req.user!.tenantId },
    });
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });
    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// PUT update tenant settings (owner only)
router.put("/me", requireRole("owner", "admin"), async (req: AuthRequest, res) => {
  try {
    const repo = AppDataSource.getRepository(Tenant);
    const tenant = await repo.findOne({ where: { id: req.user!.tenantId } });
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });

    const { name, phone, gstin, address, city, state } = req.body;
    if (name) tenant.name = name;
    if (phone !== undefined) tenant.phone = phone;
    if (gstin !== undefined) tenant.gstin = gstin;
    if (address !== undefined) tenant.address = address;
    if (city !== undefined) tenant.city = city;
    if (state !== undefined) tenant.state = state;

    const saved = await repo.save(tenant);
    res.json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
