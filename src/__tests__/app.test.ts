import request from 'supertest';
import app from '../app';

describe('App Tests', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect('Content-Type', /json/).expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/').expect('Content-Type', /json/).expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Welcome to Node.js TypeScript CI/CD Demo API'
      );
    });
  });

  describe('GET /api/users', () => {
    it('should return list of users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body.users).toHaveLength(2);
      expect(response.body.users[0]).toHaveProperty('name', 'John Doe');
      expect(response.body.users[0]).toHaveProperty('email', 'john@example.com');
      expect(response.body.users[1]).toHaveProperty('name', 'Jane Smith');
      expect(response.body.users[1]).toHaveProperty('email', 'jane@example.com');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 routes', async () => {
      await request(app).get('/non-existent-route').expect(404);
    });
  });
});
