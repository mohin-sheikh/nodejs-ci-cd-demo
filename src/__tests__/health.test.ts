import request from 'supertest';
import app from '../app';

describe('Health Check', () => {
  it('should return OK status', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body.status).toBe('OK');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should return welcome message', async () => {
    const response = await request(app).get('/').expect(200);

    expect(response.body.message).toBe('Welcome to Node.js TypeScript CI/CD Demo API');
  });
});
