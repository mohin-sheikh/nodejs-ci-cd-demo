import app from './app';
import { AppDataSource } from './config/database';
import { config } from './config/validate';

AppDataSource.initialize()
  .then(() => {
    console.log('Database connection established successfully');
    console.log(`Host: ${config.database.host}:${config.database.port}`);
    console.log(`Database: ${config.database.database}`);

    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Health check: http://localhost:${config.port}/health`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
    console.error('Please check your database configuration in .env file');
    process.exit(1);
  });
