import request from 'supertest';
import app from '../../app';
import { AppDataSource } from '../../config/database';

describe('User API Integration Tests', () => {
  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'Integration Test User',
        email: `test${Date.now()}@example.com`,
        password: 'Test@123456',
      };

      const response = await request(app).post('/api/users').send(newUser).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(newUser.email);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 409 for duplicate email', async () => {
      const email = `duplicate${Date.now()}@example.com`;

      await request(app).post('/api/users').send({
        name: 'First User',
        email,
        password: 'Test@123456',
      });

      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Second User',
          email,
          password: 'Test@123456',
        })
        .expect(409);

      expect(response.body.message).toContain('already exists');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by id', async () => {
      const createResponse = await request(app)
        .post('/api/users')
        .send({
          name: 'Get Test User',
          email: `get${Date.now()}@example.com`,
          password: 'Test@123456',
        });

      const userId = createResponse.body.data.id;

      const getResponse = await request(app).get(`/api/users/${userId}`).expect(200);

      expect(getResponse.body.data.id).toBe(userId);
      expect(getResponse.body.data.name).toBe('Get Test User');
      expect(getResponse.body.data).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      await request(app).get(`/api/users/${fakeId}`).expect(404);
    });
  });
});
