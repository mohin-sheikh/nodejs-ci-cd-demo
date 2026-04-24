import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../services/user.service';
import { ResponseHandler } from '../../utils/response';
import { ResponseMessages } from '../../utils/responseMessages';
import { User } from '../../entities/User';

// Helper function to remove password from user object
const removePassword = <T extends Partial<User>>(user: T): Omit<T, 'password'> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export class UserController {
  private userService: UserService;

  constructor(userService?: UserService) {
    this.userService = userService || new UserService();
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.getAllUsers();
      const usersWithoutPasswords = users.map((user) => removePassword(user));
      return ResponseHandler.success(res, usersWithoutPasswords, ResponseMessages.USERS_RETRIEVED);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await this.userService.getUserById(id);
      if (!user) {
        return ResponseHandler.notFound(res, ResponseMessages.USER_NOT_FOUND);
      }
      return ResponseHandler.success(res, removePassword(user), ResponseMessages.USER_RETRIEVED);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.createUser(req.body);
      return ResponseHandler.created(res, removePassword(user), ResponseMessages.USER_CREATED);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await this.userService.updateUser(id, req.body);
      if (!user) {
        return ResponseHandler.notFound(res, ResponseMessages.USER_NOT_FOUND);
      }
      return ResponseHandler.success(res, removePassword(user), ResponseMessages.USER_UPDATED);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const deleted = await this.userService.deleteUser(id);
      if (!deleted) {
        return ResponseHandler.notFound(res, ResponseMessages.USER_NOT_FOUND);
      }
      return ResponseHandler.noContent(res, ResponseMessages.USER_DELETED);
    } catch (error) {
      next(error);
    }
  }
}
