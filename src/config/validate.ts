import * as dotenv from 'dotenv';

dotenv.config();

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface AppConfig {
  port?: number; // Make port optional
  nodeEnv: string;
  database: DatabaseConfig;
}

export function validateConfig(): AppConfig {
  // Validate PORT - only required if not in migration context
  let port: number | undefined;
  if (process.env.PORT) {
    port = parseInt(process.env.PORT);
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(
        `PORT must be a valid port number between 1 and 65535, got: ${process.env.PORT}`
      );
    }
  }

  // Validate NODE_ENV
  const nodeEnv = process.env.NODE_ENV || 'development';
  const validEnvs = ['development', 'production', 'test'];
  if (!validEnvs.includes(nodeEnv)) {
    throw new Error(`NODE_ENV must be one of: ${validEnvs.join(', ')}, got: ${nodeEnv}`);
  }

  // Validate database configuration
  const requiredDbVars = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'];
  const missingDbVars = requiredDbVars.filter((varName) => !process.env[varName]);

  if (missingDbVars.length > 0) {
    throw new Error(
      `Missing required database environment variables: ${missingDbVars.join(', ')}\n` +
        `Please create a .env file with these variables. See .env.example for reference.`
    );
  }

  const dbPort = parseInt(process.env.DB_PORT!);
  if (isNaN(dbPort) || dbPort < 1 || dbPort > 65535) {
    throw new Error(
      `DB_PORT must be a valid port number between 1 and 65535, got: ${process.env.DB_PORT}`
    );
  }

  return {
    port,
    nodeEnv,
    database: {
      host: process.env.DB_HOST!,
      port: dbPort,
      username: process.env.DB_USERNAME!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_DATABASE!,
    },
  };
}

export const config = validateConfig();
