import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate, validateParams } from '../middlewares/validation.middleware';
import { createUserSchema, updateUserSchema, userIdSchema } from '../../validators/user.validator';

const router = Router();
const userController = new UserController();

// Get all users
router.get('/', userController.getAllUsers.bind(userController));

// Get user by ID
router.get('/:id', validateParams(userIdSchema), userController.getUserById.bind(userController));

// Create user
router.post('/', validate(createUserSchema), userController.createUser.bind(userController));

// Update user
router.put(
  '/:id',
  validateParams(userIdSchema),
  validate(updateUserSchema),
  userController.updateUser.bind(userController)
);

// Delete user
router.delete('/:id', validateParams(userIdSchema), userController.deleteUser.bind(userController));

export default router;
