import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate, validateParams } from '../middlewares/validation.middleware';
import { createUserSchema, updateUserSchema, userIdSchema } from '../../validators/user.validator';
import { authenticate, requireActiveUser } from '../middlewares/auth.middleware';
import { apiRateLimit, strictRateLimit } from '../middlewares/rateLimit.middleware';

const router = Router();
const userController = new UserController();

router.post(
  '/',
  strictRateLimit,
  validate(createUserSchema),
  userController.createUser.bind(userController)
);

router.use(authenticate);
router.use(requireActiveUser);

router.get('/', apiRateLimit, userController.getAllUsers.bind(userController));
router.get(
  '/:id',
  apiRateLimit,
  validateParams(userIdSchema),
  userController.getUserById.bind(userController)
);
router.put(
  '/:id',
  apiRateLimit,
  validateParams(userIdSchema),
  validate(updateUserSchema),
  userController.updateUser.bind(userController)
);
router.delete(
  '/:id',
  strictRateLimit,
  validateParams(userIdSchema),
  userController.deleteUser.bind(userController)
);

export default router;
