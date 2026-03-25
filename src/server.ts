import app from './app';
import { AppDataSource } from './config/database';
import { config } from './config/validate';

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log('Database connection established successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Users API: http://localhost:${PORT}/api/users`);
    });
  })
  .catch((error) => {
    console.log('Error connecting to database:', error);
    console.log('Please check your database configuration in .env file');
    process.exit(1);
  });
