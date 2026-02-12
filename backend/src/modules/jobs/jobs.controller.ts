import { Request, Response } from "express";
import * as jobsService from "./jobs.service";
import { AuthRequest } from "../../middleware/auth.middleware";

export const saveJob = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    console.log("checking the save job api", req.body);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { title, company } = req.body;

    if (!title || !company) {
      res.status(400).json({ error: "Title and Company are required" });
      return;
    }

    const job = await jobsService.createJob({
      userId,
      ...req.body,
    });

    res.status(201).json(job);
  } catch (error: any) {
    console.error("Error saving job:", error);
    res.status(500).json({ error: "Failed to save job" });
  }
};

export const getJobs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const jobs = await jobsService.getUserJobs(userId);
    res.status(200).json(jobs);
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    await jobsService.deleteJob(id as string, userId);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting job:", error);
    if (error.code === 'P2025') {
       res.status(404).json({ error: "Job not found or unauthorized" });
       return;
    }
    res.status(500).json({ error: "Failed to delete job" });
  }
};

export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const job = await jobsService.updateJob(id as string, userId, req.body);
    res.status(200).json(job);
  } catch (error: any) {
    console.error("Error updating job:", error);
    if (error.code === 'P2025') {
       res.status(404).json({ error: "Job not found or unauthorized" });
       return;
    }
    res.status(500).json({ error: "Failed to update job" });
  }
};
