import pool from '../../shared/db';
import { z } from 'zod';
import { jobSchema } from './jobs.schema';

export class JobsService {
  async create(userId: number, data: z.infer<typeof jobSchema>) {
    const { title, company, platform, location, salary, job_url, status, description, hr_name, hr_email, hr_phone, posted_date } = data;
    
    // Check if job exists
    const existingJob = await pool.query(
      'SELECT * FROM jobs WHERE user_id = $1 AND job_url = $2',
      [userId, job_url]
    );

    if (existingJob.rows.length > 0) {
      // Update existing job
      const jobId = existingJob.rows[0].id;
      const result = await pool.query(
        `UPDATE jobs SET
          title = $1, company = $2, platform = $3, location = $4, salary = $5, 
          status = $6, description = $7, hr_name = $8, hr_email = $9, hr_phone = $10, posted_date = $11, updated_at = NOW()
         WHERE id = $12 AND user_id = $13
         RETURNING *`,
        [title, company, platform, location, salary, status, description, hr_name, hr_email, hr_phone, posted_date, jobId, userId]
      );
      return result.rows[0];
    }

    // Insert new job
    const result = await pool.query(
      `INSERT INTO jobs (
        user_id, title, company, platform, location, salary, job_url, status, description, hr_name, hr_email, hr_phone, posted_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [userId, title, company, platform, location, salary, job_url, status, description, hr_name, hr_email, hr_phone, posted_date]
    );
    return result.rows[0];
  }

  async findAll(userId: number) {
    const result = await pool.query('SELECT * FROM jobs WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
  }

  async findOne(userId: number, id: number) {
    const result = await pool.query('SELECT * FROM jobs WHERE id = $1 AND user_id = $2', [id, userId]);
    return result.rows[0];
  }

  async update(userId: number, id: number, data: Partial<z.infer<typeof jobSchema>>) {
    // Dynamic update query builder could be used here, but for simplicity:
    // ... implementation left for brevity, or we can use a library like knex/prisma later
    // For now, let's just support status update as an example
    if (data.status) {
        const result = await pool.query(
            'UPDATE jobs SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [data.status, id, userId]
        );
        return result.rows[0];
    }
    return null;
  }

  async delete(userId: number, id: number) {
    await pool.query('DELETE FROM jobs WHERE id = $1 AND user_id = $2', [id, userId]);
    return { message: 'Job deleted' };
  }
}
