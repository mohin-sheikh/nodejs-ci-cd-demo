import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ResponseHandler, ValidationError } from '../../utils/response';
import { ResponseMessages } from '../../utils/responseMessages';

export const validate = (schema: Joi.ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details: ValidationError[] = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        return ResponseHandler.validationError(res, ResponseMessages.VALIDATION_FAILED, details);
      }

      req.body = value;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = schema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details: ValidationError[] = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        return ResponseHandler.validationError(res, ResponseMessages.INVALID_PARAMETERS, details);
      }

      req.params = value;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details: ValidationError[] = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        return ResponseHandler.validationError(
          res,
          ResponseMessages.INVALID_QUERY_PARAMETERS,
          details
        );
      }

      req.query = value;
      next();
    } catch (error) {
      next(error);
    }
  };
};
