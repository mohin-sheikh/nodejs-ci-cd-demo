import { AppDataSource } from '../config/database';

describe('Database Connection', () => {
  it('should connect to database', async () => {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      expect(AppDataSource.isInitialized).toBe(true);
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  });

  it('should have users table', async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

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
