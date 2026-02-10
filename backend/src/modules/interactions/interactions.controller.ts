import { Request, Response } from 'express';
import { InteractionsService } from './interactions.service';
import { interactionSchema } from './interactions.schema';

const service = new InteractionsService();

export const createInteraction = async (req: Request, res: Response) => {
  try {
    const data = interactionSchema.parse(req.body);
    const interaction = await service.create(data);
    res.status(201).json(interaction);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getJobInteractions = async (req: Request, res: Response) => {
  try {
    const jobIdParam = req.params.jobId;
    const jobId = parseInt(Array.isArray(jobIdParam) ? jobIdParam[0] : (jobIdParam || '0'), 10);
    if (isNaN(jobId)) return res.status(400).json({ error: 'Invalid Job ID' });

    const interactions = await service.findByJob(jobId);
    res.json(interactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
