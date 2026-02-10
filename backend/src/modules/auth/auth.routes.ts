import { Router } from 'express';
import { register, login, refreshToken } from './auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken as any);

export default router;
