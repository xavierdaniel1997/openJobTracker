import { Router } from 'express';
import { createJob, getJobs, getJob, deleteJob } from './jobs.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken); // Protect all job routes

router.post('/', createJob);
router.get('/', getJobs);
router.get('/:id', getJob);
router.delete('/:id', deleteJob);

export default router;
