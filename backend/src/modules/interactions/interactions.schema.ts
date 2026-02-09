import { z } from 'zod';

export const interactionSchema = z.object({
  job_id: z.number(),
  type: z.enum(['note', 'status_change', 'email', 'call']),
  content: z.string().min(1),
  date: z.string().optional(), // ISO string
});
