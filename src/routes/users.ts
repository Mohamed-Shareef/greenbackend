import { Router } from "express";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entities/User";
import { authenticate, AuthRequest, requireRole } from "../middleware/auth";

const router = Router();

// All user routes require auth
router.use(authenticate);

// GET all users for the current tenant
router.get("/", async (req: AuthRequest, res) => {
  try {
    const users = await AppDataSource.getRepository(User).find({
      where: { tenantId: req.user!.tenantId },
      order: { createdAt: "DESC" },
      select: ["id", "name", "email", "role", "isActive", "lastLogin", "createdAt"],
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// GET single user
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: req.params.id, tenantId: req.user!.tenantId },
      select: ["id", "name", "email", "role", "isActive", "lastLogin", "createdAt"],
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// POST create user (owner/admin only)
router.post("/", requireRole("owner", "admin"), async (req: AuthRequest, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password required" });
    }

    const repo = AppDataSource.getRepository(User);
    if (await repo.findOne({ where: { email, tenantId: req.user!.tenantId } })) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = repo.create({
      tenantId: req.user!.tenantId,
      name,
      email,
      password: hashed,
      role: role || UserRole.CASHIER,
      isActive: true,
    });
    const saved = await repo.save(user);
    const { password: _p, ...safeUser } = saved as any;
    res.status(201).json({ success: true, data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// PUT update user
router.put("/:id", requireRole("owner", "admin"), async (req: AuthRequest, res) => {
  try {
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { name, email, password, role } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) user.password = await bcrypt.hash(password, 10);

    const saved = await repo.save(user);
    const { password: _p, ...safeUser } = saved as any;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// PATCH toggle active status
router.patch("/:id/toggle", requireRole("owner", "admin"), async (req: AuthRequest, res) => {
  try {
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.id === req.user!.userId) {
      return res.status(400).json({ success: false, message: "Cannot disable your own account" });
    }
    user.isActive = !user.isActive;
    await repo.save(user);
    res.json({ success: true, data: { isActive: user.isActive } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// DELETE user
router.delete("/:id", requireRole("owner", "admin"), async (req: AuthRequest, res) => {
  try {
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.id === req.user!.userId) {
      return res.status(400).json({ success: false, message: "Cannot delete your own account" });
    }
    await repo.remove(user);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
