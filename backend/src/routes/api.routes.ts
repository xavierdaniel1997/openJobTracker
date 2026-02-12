import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import jobsRoutes from "../modules/jobs/jobs.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/jobs", jobsRoutes);

export default router;