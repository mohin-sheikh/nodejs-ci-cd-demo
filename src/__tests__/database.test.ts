import { AppDataSource } from '../config/database';

describe('Database Connection', () => {
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

  it('should connect to database', async () => {
    expect(AppDataSource.isInitialized).toBe(true);
  });

  it('should have users table', async () => {
    const result = await AppDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    expect(result[0].exists).toBe(true);
  });
});
