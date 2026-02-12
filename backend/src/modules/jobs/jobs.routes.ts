import { Router } from "express";
import * as jobsController from "./jobs.controller";
import { authenticateToken } from "../../middleware/auth.middleware";

const router = Router();

// Protect all job routes
router.use(authenticateToken);

router.post("/", jobsController.saveJob);
router.get("/", jobsController.getJobs);
router.delete("/:id", jobsController.deleteJob);
router.patch("/:id", jobsController.updateJob);

export default router;
