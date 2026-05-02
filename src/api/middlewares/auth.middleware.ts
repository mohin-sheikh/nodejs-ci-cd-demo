import { Request, Response, NextFunction } from 'express';
import { JWTService, TokenPayload } from '../../services/jwt.service';
import { ResponseHandler } from '../../utils/response';

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseHandler.unauthorized(res, 'No token provided. Please login first.');
    }

    const token = authHeader.substring(7);
    const decoded = JWTService.verifyAccessToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Token expired') {
        return ResponseHandler.unauthorized(res, 'Token expired. Please login again.');
      }
      if (error.message === 'Invalid token') {
        return ResponseHandler.unauthorized(res, 'Invalid token. Please login again.');
      }
      return ResponseHandler.unauthorized(res, error.message);
    }
    return ResponseHandler.unauthorized(res, 'Authentication failed');
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = JWTService.verifyAccessToken(token);
      req.user = decoded;
    }
    next();
  } catch {
    next();
  }
};

export const requireActiveUser = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return ResponseHandler.unauthorized(res, 'Authentication required');
  }
  next();
};
