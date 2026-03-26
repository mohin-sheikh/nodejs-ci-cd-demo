import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../services/user.service';
import { ResponseHandler } from '../../utils/response';
import { ResponseMessages } from '../../utils/responseMessages';

const userService = new UserService();

export class UserController {
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      return ResponseHandler.success(res, users, ResponseMessages.USERS_RETRIEVED);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await userService.getUserById(id);
      if (!user) {
        return ResponseHandler.notFound(res, ResponseMessages.USER_NOT_FOUND);
      }
      return ResponseHandler.success(res, user, ResponseMessages.USER_RETRIEVED);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body);
      return ResponseHandler.created(res, user, ResponseMessages.USER_CREATED);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await userService.updateUser(id, req.body);
      if (!user) {
        return ResponseHandler.notFound(res, ResponseMessages.USER_NOT_FOUND);
      }
      return ResponseHandler.success(res, user, ResponseMessages.USER_UPDATED);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const deleted = await userService.deleteUser(id);
      if (!deleted) {
        return ResponseHandler.notFound(res, ResponseMessages.USER_NOT_FOUND);
      }
      return ResponseHandler.noContent(res, ResponseMessages.USER_DELETED);
    } catch (error) {
      next(error);
    }
  }
}
