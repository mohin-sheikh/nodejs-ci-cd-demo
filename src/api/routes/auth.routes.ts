import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { loginSchema } from '../../validators/auth.validator';

const router = Router();
const authController = new AuthController();

router.post('/login', validate(loginSchema), authController.login.bind(authController));

export default router;
