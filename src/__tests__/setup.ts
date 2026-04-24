// src/__tests__/setup.ts
import { AppDataSource } from '../config/database';

beforeAll(async () => {
  // Ensure database is initialized before tests
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

afterAll(async () => {
  // Clean up after all tests
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

// Increase timeout for database operations
jest.setTimeout(30000);
