import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import userRoutes from './api/routes/user.routes';
import { errorHandler } from './api/middlewares/error.middleware';
import { AppDataSource } from './config/database';
import { ResponseHandler } from './utils/response';
import { ResponseMessages } from './utils/responseMessages';

const app: Application = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS?.split(',') : '*',
    credentials: true,
  })
);

app.get('/health', (_req: Request, res: Response) => {
  const healthData = {
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    database: AppDataSource.isInitialized ? 'connected' : 'disconnected',
  };
  return ResponseHandler.success(res, healthData, ResponseMessages.HEALTH_CHECK_PASSED);
});

app.get('/', (_req: Request, res: Response) => {
  return ResponseHandler.success(
    res,
    { message: 'Welcome to Node.js TypeScript CI/CD Demo API' },
    ResponseMessages.API_RUNNING
  );
});

app.use('/api/users', userRoutes);

app.use('*', (req: Request, res: Response) => {
  ResponseHandler.notFound(res, `Cannot ${req.method} ${req.originalUrl}`);
});

app.use(errorHandler);

export default app;
