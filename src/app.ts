import express, { Application, Request, Response } from 'express';
import userRoutes from './api/routes/user.routes';
import { errorHandler } from './api/middlewares/error.middleware';
import { AppDataSource } from './config/database';

const app: Application = express();

app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: AppDataSource.isInitialized ? 'connected' : 'disconnected',
  });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to Node.js TypeScript CI/CD Demo API' });
});

app.use('/api/users', userRoutes);

app.use(errorHandler);

export default app;
