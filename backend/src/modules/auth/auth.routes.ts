import { Router } from 'express';
import { 
  registerController, 
  loginController, 
  refreshTokenController, 
  getCurrentUserController 
} from './auth.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/refresh', refreshTokenController);
router.get('/me', authenticateToken, getCurrentUserController);

export default router;
