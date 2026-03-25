import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err.message === 'User with this email already exists') {
    res.status(409).json({ error: err.message });
    return;
  }

  if (err.message === 'User not found') {
    res.status(404).json({ error: err.message });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
