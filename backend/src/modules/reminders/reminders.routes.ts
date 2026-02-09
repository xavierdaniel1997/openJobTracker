import { Router } from 'express';
import { createReminder, getPendingReminders, completeReminder } from './reminders.controller';

const router = Router();

router.post('/', createReminder);
router.get('/', getPendingReminders);
router.patch('/:id/complete', completeReminder);

export default router;
