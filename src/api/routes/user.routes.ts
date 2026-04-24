import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate, validateParams } from '../middlewares/validation.middleware';
import { createUserSchema, updateUserSchema, userIdSchema } from '../../validators/user.validator';

const router = Router();
const userController = new UserController(); // This will use default UserService

router.get('/', userController.getAllUsers.bind(userController));
router.get('/:id', validateParams(userIdSchema), userController.getUserById.bind(userController));
router.post('/', validate(createUserSchema), userController.createUser.bind(userController));
router.put(
  '/:id',
  validateParams(userIdSchema),
  validate(updateUserSchema),
  userController.updateUser.bind(userController)
);
router.delete('/:id', validateParams(userIdSchema), userController.deleteUser.bind(userController));

export default router;
