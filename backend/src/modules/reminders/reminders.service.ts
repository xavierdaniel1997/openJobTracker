import pool from '../../shared/db';
import { z } from 'zod';
import { reminderSchema } from './reminders.schema';

export class RemindersService {
  async create(data: z.infer<typeof reminderSchema>) {
    const { job_id, due_date, note, status } = data;
    
    const result = await pool.query(
      'INSERT INTO reminders (job_id, due_date, note, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [job_id, due_date, note, status]
    );
    return result.rows[0];
  }

  async findAllPending(userId: number) {
    // Requires joining with jobs to filter by user
    const result = await pool.query(
      `SELECT r.*, j.title as job_title, j.company 
       FROM reminders r 
       JOIN jobs j ON r.job_id = j.id 
       WHERE j.user_id = $1 AND r.status = 'pending' 
       ORDER BY r.due_date ASC`,
      [userId]
    );
    return result.rows;
  }

  async markAsDone(id: number) {
    const result = await pool.query(
      "UPDATE reminders SET status = 'done' WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }
}
