import express, { Application, Request, Response, NextFunction } from 'express';
import { logger } from './logger';

const app: Application = express();

app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Welcome endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to Node.js TypeScript CI/CD Demo API' });
});

// User endpoint example
app.get('/api/users', (_req: Request, res: Response) => {
  res.json({
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ],
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.stack || err.message);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app;
