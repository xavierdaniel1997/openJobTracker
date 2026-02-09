import pool from '../../shared/db';
import { z } from 'zod';
import { interactionSchema } from './interactions.schema';

export class InteractionsService {
  async create(data: z.infer<typeof interactionSchema>) {
    const { job_id, type, content, date } = data;
    
    const result = await pool.query(
      'INSERT INTO interactions (job_id, type, content, date) VALUES ($1, $2, $3, $4) RETURNING *',
      [job_id, type, content, date || new Date().toISOString()]
    );
    return result.rows[0];
  }

  async findByJob(jobId: number) {
    const result = await pool.query('SELECT * FROM interactions WHERE job_id = $1 ORDER BY date DESC', [jobId]);
    return result.rows;
  }
}
