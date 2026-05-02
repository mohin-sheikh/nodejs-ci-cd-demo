import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  if (req.url === '/favicon.ico') {
    return next();
  }

  const start = Date.now();

  console.log(`${req.method} ${req.url} - Request received`);

  const originalEnd = res.json;

  res.json = function (body) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    console.log(`${req.method} ${req.url} - ${statusCode} - ${duration}ms`);

    if (req.method === 'POST' || req.method === 'PUT') {
      const logBody = { ...req.body };
      if (logBody.password) logBody.password = '***';
      console.log(`   Body:`, JSON.stringify(logBody));
    }

    if (Object.keys(req.params).length > 0) {
      console.log(`   Params:`, req.params);
    }

    if (Object.keys(req.query).length > 0) {
      console.log(`   Query:`, req.query);
    }

    return originalEnd.call(this, body);
  };

  next();
};
