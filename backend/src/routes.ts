import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import jobRoutes from './modules/jobs/jobs.routes';
import interactionRoutes from './modules/interactions/interactions.routes';
import reminderRoutes from './modules/reminders/reminders.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/interactions', interactionRoutes);
router.use('/reminders', reminderRoutes);

export default router;
