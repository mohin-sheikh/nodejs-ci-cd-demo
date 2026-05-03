import app from './app';
import { AppDataSource } from './config/database';
import { config } from './config/validate';
import RedisConnection from './config/redis';

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(async () => {
    console.log('Database connection established successfully');

    try {
      await RedisConnection.getClient();
      console.log('Redis connection established successfully');
    } catch (error) {
      console.error('Warning: Redis connection failed:', error);
      console.log('Continuing without Redis...');
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
    process.exit(1);
  });

const gracefulShutdown = async (signal: string) => {
  console.log(`${signal} received, closing server...`);

  try {
    await RedisConnection.disconnect();
    console.log('Redis connection closed');
  } catch (error) {
    console.error('Error closing Redis connection:', error);
  }

  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed');
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
  }

  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
