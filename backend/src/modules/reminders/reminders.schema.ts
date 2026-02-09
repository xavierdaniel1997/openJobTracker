import { z } from 'zod';

export const reminderSchema = z.object({
  job_id: z.number(),
  due_date: z.string(), // ISO string
  note: z.string().optional(),
  status: z.enum(['pending', 'done']).default('pending'),
});
