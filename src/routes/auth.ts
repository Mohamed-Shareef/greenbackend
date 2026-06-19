import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entities/User";
import { Tenant } from "../entities/Tenant";
import { authenticate, AuthRequest, signToken } from "../middleware/auth";

const router = Router();

// ─── Register (creates tenant + owner user) ─────────────────────────────────
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { tenantCode, companyName, email, password, ownerName } = req.body;
    if (!tenantCode || !companyName || !email || !password || !ownerName) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const tenantRepo = AppDataSource.getRepository(Tenant);
    const userRepo   = AppDataSource.getRepository(User);

    if (await tenantRepo.findOne({ where: { tenantCode: tenantCode.toUpperCase() } })) {
      return res.status(400).json({ success: false, message: "Tenant code already taken" });
    }
    if (await userRepo.findOne({ where: { email } })) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const tenant = tenantRepo.create({
      tenantCode: tenantCode.toUpperCase(),
      name: companyName,
      email,
      plan: "free",
      isActive: true,
    });
    const savedTenant = await tenantRepo.save(tenant);

    const hashed = await bcrypt.hash(password, 10);
    const user = userRepo.create({
      tenantId: savedTenant.id,
      name: ownerName,
      email,
      password: hashed,
      role: UserRole.OWNER,
      isActive: true,
    });
    await userRepo.save(user);

    res.status(201).json({ success: true, message: "Account created. Please sign in." });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// ─── Login ───────────────────────────────────────────────────────────────────
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { tenantCode, email, password } = req.body;
    if (!tenantCode || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const tenantRepo = AppDataSource.getRepository(Tenant);
    const userRepo   = AppDataSource.getRepository(User);

    const tenant = await tenantRepo.findOne({
      where: { tenantCode: tenantCode.toUpperCase(), isActive: true },
    });
    if (!tenant) {
      return res.status(401).json({ success: false, message: "Invalid tenant code" });
    }

    const user = await userRepo.findOne({
      where: { email, tenantId: tenant.id, isActive: true },
    });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Update last login
    user.lastLogin = new Date();
    await userRepo.save(user);

    const token = signToken({
      userId: user.id,
      tenantId: tenant.id,
      role: user.role,
      tenantCode: tenant.tenantCode,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        tenantName: tenant.name,
        plan: tenant.plan,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// ─── Me (verify token & refresh user info) ───────────────────────────────────
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: req.user!.userId },
      relations: ["tenant"],
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantCode: user.tenant.tenantCode,
        tenantName: user.tenant.name,
        plan: user.tenant.plan,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
