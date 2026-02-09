import { z } from 'zod';

export const jobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  platform: z.string().optional(),
  location: z.string().optional(),
  salary: z.string().optional(),
  job_url: z.string().url(),
  status: z.enum(['applied', 'interview', 'offer', 'rejected']).default('applied'),
  description: z.string().optional(),
  posted_date: z.string().optional(),
  hr_name: z.string().optional(),
  hr_email: z.string().email().optional().or(z.literal('')),
  hr_phone: z.string().optional(),
});
