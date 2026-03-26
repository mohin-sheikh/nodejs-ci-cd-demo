import { Request, Response, NextFunction } from 'express';
import * as Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        res.status(400).json({
          error: 'Validation failed',
          details,
        });
        return;
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
        const details = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        res.status(400).json({
          error: 'Invalid parameters',
          details,
        });
        return;
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
        const details = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        res.status(400).json({
          error: 'Invalid query parameters',
          details,
        });
        return;
      }

      req.query = value;
      next();
    } catch (error) {
      next(error);
    }
  };
};
