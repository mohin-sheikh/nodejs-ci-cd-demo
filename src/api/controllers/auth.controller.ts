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
}
