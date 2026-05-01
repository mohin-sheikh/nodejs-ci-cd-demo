import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/auth.service';
import { ResponseHandler } from '../../utils/response';

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
        return ResponseHandler.unauthorized(res, 'Invalid email or password');
      }

      return ResponseHandler.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }
}
