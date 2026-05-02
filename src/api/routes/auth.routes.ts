import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { loginSchema } from '../../validators/auth.validator';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

router.post('/login', validate(loginSchema), authController.login.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

export default router;
