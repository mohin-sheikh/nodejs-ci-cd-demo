import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/auth.service';
import { ResponseHandler } from '../../utils/response';
import { ResponseMessages } from '../../utils/responseMessages';

export class AuthController {
  private authService: AuthService;

  constructor(authService?: AuthService) {
    this.authService = authService || new AuthService();
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);

      if (!result) {
        return ResponseHandler.unauthorized(res, ResponseMessages.INVALID_CREDENTIALS);
      }

      return ResponseHandler.success(res, result, ResponseMessages.LOGIN_SUCCESS);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return ResponseHandler.badRequest(res, ResponseMessages.REFRESH_TOKEN_REQUIRED);
      }

      const newTokens = await this.authService.refreshToken(refreshToken);

      if (!newTokens) {
        return ResponseHandler.unauthorized(res, ResponseMessages.INVALID_REFRESH_TOKEN);
      }

      return ResponseHandler.success(res, { tokens: newTokens }, ResponseMessages.TOKEN_REFRESHED);
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req['user']) {
        return ResponseHandler.unauthorized(res, ResponseMessages.USER_NOT_AUTHENTICATED);
      }

      return ResponseHandler.success(res, { user: req['user'] }, ResponseMessages.SUCCESS);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ResponseHandler.badRequest(res, ResponseMessages.NO_TOKEN_PROVIDED);
      }

      const token = authHeader.substring(7);
      const userId = req.user?.id;

      if (!userId) {
        return ResponseHandler.unauthorized(res, ResponseMessages.USER_NOT_AUTHENTICATED);
      }

      await this.authService.logout(userId, token);

      return ResponseHandler.success(res, {}, ResponseMessages.LOGOUT_SUCCESS);
    } catch (error) {
      next(error);
    }
  }

  async logoutAllDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return ResponseHandler.unauthorized(res, ResponseMessages.USER_NOT_AUTHENTICATED);
      }

      await this.authService.logoutAllDevices(userId);

      return ResponseHandler.success(res, {}, ResponseMessages.LOGOUT_ALL_SUCCESS);
    } catch (error) {
      next(error);
    }
  }

  async getActiveSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return ResponseHandler.unauthorized(res, ResponseMessages.USER_NOT_AUTHENTICATED);
      }

      const sessions = await this.authService.getActiveSessions(userId);

      return ResponseHandler.success(res, { sessions }, ResponseMessages.SESSIONS_RETRIEVED);
    } catch (error) {
      next(error);
    }
  }
}
