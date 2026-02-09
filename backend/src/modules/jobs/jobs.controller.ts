import { Request, Response } from 'express';
import { JobsService } from './jobs.service';
import { jobSchema } from './jobs.schema';

const jobsService = new JobsService();

// Mock user ID middleware integration (to be replaced by actual auth middleware)
const getUserId = (req: Request) => (req as any).user?.id || 1; 

export const createJob = async (req: Request, res: Response) => {
  try {
    const data = jobSchema.parse(req.body);
    const job = await jobsService.create(getUserId(req), data);
    res.status(201).json(job);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await jobsService.findAll(getUserId(req));
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getJob = async (req: Request, res: Response) => {
  try {
    const id = parseInt((req.params.id as string) || '0');
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    
    const job = await jobsService.findOne(getUserId(req), id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const id = parseInt((req.params.id as string) || '0');
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    await jobsService.delete(getUserId(req), id);
    res.json({ message: 'Job deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
