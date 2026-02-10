import { Request, Response } from 'express';
import { RemindersService } from './reminders.service';
import { reminderSchema } from './reminders.schema';

const service = new RemindersService();
const getUserId = (req: Request) => (req as any).user?.id || 1; 

export const createReminder = async (req: Request, res: Response) => {
  try {
    const data = reminderSchema.parse(req.body);
    const reminder = await service.create(data);
    res.status(201).json(reminder);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getPendingReminders = async (req: Request, res: Response) => {
  try {
    const reminders = await service.findAllPending(getUserId(req));
    res.json(reminders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const completeReminder = async (req: Request, res: Response) => {
  try {
    const id = parseInt((req.params.id as string) || '0');
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const reminder = await service.markAsDone(id);
    res.json(reminder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
