import prisma from "../../config/db";

export interface CreateJobInput {
  userId: string;
  title: string;
  company: string;
  platform?: string;
  location?: string;
  salary?: string;
  jobUrl?: string;
  status?: string;
  notes?: string;
  hrName?: string;
  hrEmail?: string;
  hrPhone?: string;
  jobId?: string;
  interviewDate?: Date | string;
  contactMethod?: string;
  feedback?: string;
  scrapedAt?: Date | string;
}

export const createJob = async (data: CreateJobInput) => {
  return await prisma.job.create({
    data: {
      userId: data.userId,
      title: data.title,
      company: data.company,
      platform: data.platform,
      location: data.location,
      salary: data.salary,
      jobUrl: data.jobUrl,
      status: data.status || "applied",
      notes: data.notes,
      hrName: data.hrName,
      hrEmail: data.hrEmail,
      hrPhone: data.hrPhone,
      jobId: data.jobId,
      interviewDate: data.interviewDate ? new Date(data.interviewDate) : undefined,
      contactMethod: data.contactMethod,
      feedback: data.feedback,
      scrapedAt: data.scrapedAt ? new Date(data.scrapedAt) : undefined,
    },
  });
};

export const getUserJobs = async (userId: string) => {
  return await prisma.job.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const deleteJob = async (id: string, userId: string) => {
  return await prisma.job.delete({
    where: {
      id,
      userId, // Ensure the job belongs to the user
    },
  });
};

export const updateJob = async (id: string, userId: string, data: Partial<CreateJobInput>) => {
  return await prisma.job.update({
    where: {
      id,
      userId,
    },
    data: {
      title: data.title,
      company: data.company,
      platform: data.platform,
      location: data.location,
      salary: data.salary,
      jobUrl: data.jobUrl,
      status: data.status,
      notes: data.notes,
      hrName: data.hrName,
      hrEmail: data.hrEmail,
      hrPhone: data.hrPhone,
      jobId: data.jobId,
      interviewDate: data.interviewDate ? new Date(data.interviewDate) : undefined,
      contactMethod: data.contactMethod,
      feedback: data.feedback,
      scrapedAt: data.scrapedAt ? new Date(data.scrapedAt) : undefined,
    },
  });
};
