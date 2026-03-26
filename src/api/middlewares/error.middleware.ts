import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../../utils/response';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err.message === 'User with this email already exists') {
    return ResponseHandler.conflict(res, err.message);
  }

  if (err.message === 'User not found') {
    return ResponseHandler.notFound(res, err.message);
  }

  if (err.name === 'ValidationError') {
    return ResponseHandler.validationError(res, err.message);
  }

  return ResponseHandler.error(
    res,
    'Internal server error',
    500,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : undefined
  );
};
