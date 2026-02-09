import { Router } from 'express';
import { createInteraction, getJobInteractions } from './interactions.controller';

const router = Router();

router.post('/', createInteraction);
router.get('/job/:jobId', getJobInteractions);

export default router;
