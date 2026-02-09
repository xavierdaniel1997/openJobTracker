import { Router } from 'express';
import { createJob, getJobs, getJob, deleteJob } from './jobs.controller';
// import { authenticate } from '../../shared/middleware'; // To be implemented

const router = Router();

// router.use(authenticate);

router.post('/', createJob);
router.get('/', getJobs);
router.get('/:id', getJob);
router.delete('/:id', deleteJob);

export default router;
