import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate, validateParams } from '../middlewares/validation.middleware';
import { createUserSchema, updateUserSchema, userIdSchema } from '../../validators/user.validator';
import { authenticate, requireActiveUser } from '../middlewares/auth.middleware';

const router = Router();
const userController = new UserController();

// Public routes (no authentication required)
router.post('/', validate(createUserSchema), userController.createUser.bind(userController));

// Protected routes (authentication required for all other endpoints)
router.use(authenticate);
router.use(requireActiveUser);

router.get('/', userController.getAllUsers.bind(userController));
router.get('/:id', validateParams(userIdSchema), userController.getUserById.bind(userController));
router.put(
  '/:id',
  validateParams(userIdSchema),
  validate(updateUserSchema),
  userController.updateUser.bind(userController)
);
router.delete('/:id', validateParams(userIdSchema), userController.deleteUser.bind(userController));

export default router;
