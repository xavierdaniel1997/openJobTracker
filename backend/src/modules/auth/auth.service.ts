import pool from '../../shared/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { registerSchema, loginSchema } from './auth.schema';

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export class AuthService {
  async register(data: z.infer<typeof registerSchema>) {
    const { email, password, name } = data;
    
    // Check if user exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
      [email, hashedPassword, name]
    );
    
    const user = result.rows[0];
    const tokens = this.generateTokens(user);

    return { ...tokens, user: { id: user.id, name: user.name, email: user.email } };
  }

  async login(data: z.infer<typeof loginSchema>) {
    const { email, password } = data;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    
    if (!match) {
      throw new Error('Invalid credentials');
    }

    const tokens = this.generateTokens(user);
    
    return { ...tokens, user: { id: user.id, name: user.name, email: user.email } };
  }

  generateTokens(user: any) {
    const payload = { id: user.id, email: user.email };
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    return { accessToken, refreshToken };
  }

  async refreshToken(token: string) {
    try {
      const decoded: any = jwt.verify(token, REFRESH_TOKEN_SECRET);
      // Ideally, we should check if the user still exists or if the token is blacklisted here
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      const user = result.rows[0];
      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}
