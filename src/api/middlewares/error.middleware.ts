import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../../utils/response';
import { ResponseMessages } from '../../utils/responseMessages';
import { StatusCodes } from '../../utils/statusCodes';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  // Handle duplicate email error
  if (err.message === ResponseMessages.USER_ALREADY_EXISTS) {
    return ResponseHandler.conflict(res, err.message);
  }

  // Handle user not found error
  if (err.message === ResponseMessages.USER_NOT_FOUND) {
    return ResponseHandler.notFound(res, err.message);
  }

  // Handle validation errors from Joi
  if (err.name === 'ValidationError') {
    return ResponseHandler.validationError(res, err.message);
  }

  // Handle password validation errors
  if (err.message && err.message.includes('Password must')) {
    return ResponseHandler.badRequest(res, err.message);
  }

  // Handle invalid email or password for login
  if (err.message === 'Invalid email or password') {
    return ResponseHandler.unauthorized(res, err.message);
  }

  // Default internal server error
  const errorMessage =
    process.env.NODE_ENV === 'development' ? err.message : ResponseMessages.INTERNAL_SERVER_ERROR;

  return ResponseHandler.error(res, errorMessage, StatusCodes.INTERNAL_SERVER_ERROR);
};
