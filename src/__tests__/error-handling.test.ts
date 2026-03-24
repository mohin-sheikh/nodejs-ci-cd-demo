import express, { Express, Request, Response, NextFunction } from 'express';
import request from 'supertest';

describe('Error Handling Middleware', () => {
  let app: Express;

  beforeEach(() => {
    // Create a fresh app for each test
    app = express();
    app.use(express.json());

    // Add test routes before error middleware
    app.get('/test-error', (_req: Request, _res: Response, next: NextFunction) => {
      next(new Error('Test error'));
    });

    app.get('/async-error', async (_req: Request, _res: Response, next: NextFunction) => {
      try {
        throw new Error('Async test error');
      } catch (error) {
        next(error);
      }
    });

    // Add error handling middleware at the end
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      res.status(500).json({ error: 'Something went wrong!' });
    });
  });

  it('should handle errors passed to next()', async () => {
    const response = await request(app)
      .get('/test-error')
      .expect('Content-Type', /json/)
      .expect(500);

    expect(response.body).toHaveProperty('error', 'Something went wrong!');
  });

  it('should handle async errors', async () => {
    const response = await request(app)
      .get('/async-error')
      .expect('Content-Type', /json/)
      .expect(500);

    expect(response.body).toHaveProperty('error', 'Something went wrong!');
  });
});
