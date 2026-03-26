import { validateConfig } from '../../../config/validate';

describe('validateConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_USERNAME = 'postgres';
    process.env.DB_PASSWORD = 'postgres';
    process.env.DB_DATABASE = 'node_ts_demo';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('PORT validation', () => {
    it('should not set port when PORT is not defined', () => {
      delete process.env.PORT;
      const config = validateConfig();
      expect(config.port).toBeUndefined();
    });

    it('should set port when PORT is defined and valid', () => {
      process.env.PORT = '3000';
      const config = validateConfig();
      expect(config.port).toBe(3000);
    });

    it('should throw error when PORT is not a number', () => {
      process.env.PORT = 'invalid';
      expect(() => validateConfig()).toThrow(
        'PORT must be a valid port number between 1 and 65535, got: invalid'
      );
    });

    it('should throw error when PORT is less than 1', () => {
      process.env.PORT = '0';
      expect(() => validateConfig()).toThrow(
        'PORT must be a valid port number between 1 and 65535, got: 0'
      );
    });

    it('should throw error when PORT is greater than 65535', () => {
      process.env.PORT = '70000';
      expect(() => validateConfig()).toThrow(
        'PORT must be a valid port number between 1 and 65535, got: 70000'
      );
    });
  });

  describe('NODE_ENV validation', () => {
    it('should default to development when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;
      const config = validateConfig();
      expect(config.nodeEnv).toBe('development');
    });

    it('should accept development environment', () => {
      process.env.NODE_ENV = 'development';
      const config = validateConfig();
      expect(config.nodeEnv).toBe('development');
    });

    it('should accept production environment', () => {
      process.env.NODE_ENV = 'production';
      const config = validateConfig();
      expect(config.nodeEnv).toBe('production');
    });

    it('should accept test environment', () => {
      process.env.NODE_ENV = 'test';
      const config = validateConfig();
      expect(config.nodeEnv).toBe('test');
    });

    it('should throw error for invalid NODE_ENV', () => {
      process.env.NODE_ENV = 'invalid';
      expect(() => validateConfig()).toThrow(
        'NODE_ENV must be one of: development, production, test, got: invalid'
      );
    });
  });

  describe('Database configuration validation', () => {
    it('should validate all required database variables', () => {
      const config = validateConfig();
      expect(config.database).toEqual({
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'node_ts_demo',
      });
    });

    it('should throw error when DB_HOST is missing', () => {
      delete process.env.DB_HOST;
      expect(() => validateConfig()).toThrow(
        'Missing required database environment variables: DB_HOST'
      );
    });

    it('should throw error when DB_PORT is missing', () => {
      delete process.env.DB_PORT;
      expect(() => validateConfig()).toThrow(
        'Missing required database environment variables: DB_PORT'
      );
    });

    it('should throw error when DB_USERNAME is missing', () => {
      delete process.env.DB_USERNAME;
      expect(() => validateConfig()).toThrow(
        'Missing required database environment variables: DB_USERNAME'
      );
    });

    it('should throw error when DB_PASSWORD is missing', () => {
      delete process.env.DB_PASSWORD;
      expect(() => validateConfig()).toThrow(
        'Missing required database environment variables: DB_PASSWORD'
      );
    });

    it('should throw error when DB_DATABASE is missing', () => {
      delete process.env.DB_DATABASE;
      expect(() => validateConfig()).toThrow(
        'Missing required database environment variables: DB_DATABASE'
      );
    });

    it('should throw error when multiple database variables are missing', () => {
      delete process.env.DB_HOST;
      delete process.env.DB_USERNAME;
      expect(() => validateConfig()).toThrow(
        'Missing required database environment variables: DB_HOST, DB_USERNAME'
      );
    });

    it('should throw error when DB_PORT is not a number', () => {
      process.env.DB_PORT = 'invalid';
      expect(() => validateConfig()).toThrow(
        'DB_PORT must be a valid port number between 1 and 65535, got: invalid'
      );
    });

    it('should throw error when DB_PORT is less than 1', () => {
      process.env.DB_PORT = '0';
      expect(() => validateConfig()).toThrow(
        'DB_PORT must be a valid port number between 1 and 65535, got: 0'
      );
    });

    it('should throw error when DB_PORT is greater than 65535', () => {
      process.env.DB_PORT = '70000';
      expect(() => validateConfig()).toThrow(
        'DB_PORT must be a valid port number between 1 and 65535, got: 70000'
      );
    });
  });

  describe('Complete configuration', () => {
    it('should return complete config with all environment variables', () => {
      process.env.PORT = '3000';
      process.env.NODE_ENV = 'production';
      process.env.DB_HOST = 'production-db.com';
      process.env.DB_PORT = '5433';
      process.env.DB_USERNAME = 'prod_user';
      process.env.DB_PASSWORD = 'prod_password';
      process.env.DB_DATABASE = 'prod_database';

      const config = validateConfig();

      expect(config).toEqual({
        port: 3000,
        nodeEnv: 'production',
        database: {
          host: 'production-db.com',
          port: 5433,
          username: 'prod_user',
          password: 'prod_password',
          database: 'prod_database',
        },
      });
    });

    it('should return config without port when PORT not provided', () => {
      delete process.env.PORT;
      const config = validateConfig();
      expect(config.port).toBeUndefined();
      expect(config.database).toBeDefined();
    });
  });
});
