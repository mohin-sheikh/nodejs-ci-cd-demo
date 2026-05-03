import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { loginSchema } from '../../validators/auth.validator';
import { authenticate } from '../middlewares/auth.middleware';
import { loginRateLimit } from '../middlewares/rateLimit.middleware';

const router = Router();
const authController = new AuthController();

router.post(
  '/login',
  loginRateLimit,
  validate(loginSchema),
  authController.login.bind(authController)
);
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));
router.post('/logout-all', authenticate, authController.logoutAllDevices.bind(authController));
router.get('/sessions', authenticate, authController.getActiveSessions.bind(authController));
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

export default router;
