import { Router } from 'express';
import { register, login, refreshToken, getCurrentUser } from './auth.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken as any);
router.get('/me', authenticateToken as any, getCurrentUser);

export default router;
