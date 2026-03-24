import { logger } from '../logger';

describe('Logger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = originalEnv;
  });

  describe('info', () => {
    it('should log message when NODE_ENV is not test', () => {
      process.env.NODE_ENV = 'development';
      logger.info('Test message');
      expect(consoleLogSpy).toHaveBeenCalledWith('Test message');
    });

    it('should not log message when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';
      logger.info('Test message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should log with additional arguments', () => {
      process.env.NODE_ENV = 'development';
      logger.info('Test message', 'arg1', 'arg2');
      expect(consoleLogSpy).toHaveBeenCalledWith('Test message', 'arg1', 'arg2');
    });
  });

  describe('error', () => {
    it('should log error when NODE_ENV is not test', () => {
      process.env.NODE_ENV = 'development';
      logger.error('Error message');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error message');
    });

    it('should not log error when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';
      logger.error('Error message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should log error with additional arguments', () => {
      process.env.NODE_ENV = 'development';
      logger.error('Error message', 'arg1', 'arg2');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error message', 'arg1', 'arg2');
    });
  });
});
