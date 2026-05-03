import Redis from 'ioredis';
import RedisConnection from '../../../config/redis';

jest.mock('ioredis');

interface RedisConnectionStatic {
  client: Redis | null;
  isConnecting: boolean;
  getClient(): Promise<Redis>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<boolean>;
}

describe('RedisConnection', () => {
  let mockRedisClient: jest.Mocked<Redis>;
  let connectionStatic: RedisConnectionStatic;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockRedisClient = {
      status: 'ready',
      on: jest.fn(),
      ping: jest.fn().mockResolvedValue('PONG'),
      quit: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Redis>;

    (Redis as unknown as jest.Mock).mockImplementation(() => mockRedisClient);

    connectionStatic = RedisConnection as unknown as RedisConnectionStatic;
    connectionStatic.client = null;
    connectionStatic.isConnecting = false;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getClient', () => {
    it('should return existing client if already connected', async () => {
      connectionStatic.client = mockRedisClient;

      const client = await RedisConnection.getClient();
      const client2 = await RedisConnection.getClient();

      expect(client).toBe(client2);
      expect(Redis).not.toHaveBeenCalled();
    });

    it('should create new client when no client exists', async () => {
      const originalPassword = process.env.REDIS_PASSWORD;
      delete process.env.REDIS_PASSWORD;

      connectionStatic.client = null;
      connectionStatic.isConnecting = false;

      mockRedisClient.status = 'ready';

      const client = await RedisConnection.getClient();

      expect(client).toBeDefined();
      expect(Redis).toHaveBeenCalledWith({
        host: 'localhost',
        port: 6379,
        password: undefined,
        db: 0,
        retryStrategy: expect.any(Function),
        maxRetriesPerRequest: 3,
      });

      if (originalPassword) {
        process.env.REDIS_PASSWORD = originalPassword;
      }
    });

    it('should use environment variables for configuration', async () => {
      const originalHost = process.env.REDIS_HOST;
      const originalPort = process.env.REDIS_PORT;
      const originalPassword = process.env.REDIS_PASSWORD;
      const originalDb = process.env.REDIS_DB;

      process.env.REDIS_HOST = 'redis-prod.example.com';
      process.env.REDIS_PORT = '6380';
      process.env.REDIS_PASSWORD = 'securepassword';
      process.env.REDIS_DB = '2';

      connectionStatic.client = null;
      connectionStatic.isConnecting = false;
      mockRedisClient.status = 'ready';

      await RedisConnection.getClient();

      expect(Redis).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'redis-prod.example.com',
          port: 6380,
          password: 'securepassword',
          db: 2,
        })
      );

      if (originalHost) process.env.REDIS_HOST = originalHost;
      else delete process.env.REDIS_HOST;
      if (originalPort) process.env.REDIS_PORT = originalPort;
      else delete process.env.REDIS_PORT;
      if (originalPassword) process.env.REDIS_PASSWORD = originalPassword;
      else delete process.env.REDIS_PASSWORD;
      if (originalDb) process.env.REDIS_DB = originalDb;
      else delete process.env.REDIS_DB;
    });

    it('should handle retry strategy correctly for various attempt counts', async () => {
      connectionStatic.client = null;
      connectionStatic.isConnecting = false;
      mockRedisClient.status = 'ready';

      await RedisConnection.getClient();
      const retryStrategy = (Redis as unknown as jest.Mock).mock.calls[0][0].retryStrategy;

      expect(retryStrategy(0)).toBe(0); // times = 0 should return 0
      expect(retryStrategy(1)).toBe(50); // times = 1 should return 50
      expect(retryStrategy(2)).toBe(100); // times = 2 should return 100
      expect(retryStrategy(3)).toBe(150); // times = 3 should return 150
      expect(retryStrategy(5)).toBe(250); // times = 5 should return 250
      expect(retryStrategy(10)).toBe(500); // times = 10 should return 500
      expect(retryStrategy(20)).toBe(1000); // times = 20 should return 1000
      expect(retryStrategy(40)).toBe(2000); // times >= 40 should return 2000 (capped)
      expect(retryStrategy(41)).toBe(2000); // Should stay at max 2000
      expect(retryStrategy(100)).toBe(2000); // Should stay at max 2000
    });

    it('should handle retry strategy with times = 0', async () => {
      connectionStatic.client = null;
      connectionStatic.isConnecting = false;
      mockRedisClient.status = 'ready';

      await RedisConnection.getClient();
      const retryStrategy = (Redis as unknown as jest.Mock).mock.calls[0][0].retryStrategy;

      expect(retryStrategy(0)).toBe(0);
    });

    it('should handle connection timeout', async () => {
      const slowClient = {
        status: 'connecting',
        on: jest.fn(),
        ping: jest.fn(),
        quit: jest.fn(),
      } as unknown as jest.Mocked<Redis>;

      (Redis as unknown as jest.Mock).mockImplementation(() => slowClient);
      connectionStatic.client = null;
      connectionStatic.isConnecting = false;

      const promise = RedisConnection.getClient();

      jest.advanceTimersByTime(6000);

      await expect(promise).rejects.toThrow('Redis connection timeout');
    });

    it('should wait if connection is in progress', async () => {
      connectionStatic.client = null;
      connectionStatic.isConnecting = true;

      setTimeout(() => {
        connectionStatic.client = mockRedisClient;
        connectionStatic.isConnecting = false;
        mockRedisClient.status = 'ready';
      }, 200);

      const promise = RedisConnection.getClient();

      jest.advanceTimersByTime(300);

      const client = await promise;
      expect(client).toBe(mockRedisClient);
    });

    it('should handle password being undefined correctly', async () => {
      const originalPassword = process.env.REDIS_PASSWORD;
      delete process.env.REDIS_PASSWORD;

      connectionStatic.client = null;
      connectionStatic.isConnecting = false;
      mockRedisClient.status = 'ready';

      await RedisConnection.getClient();

      expect(Redis).toHaveBeenCalledWith(
        expect.objectContaining({
          password: undefined,
        })
      );

      if (originalPassword) {
        process.env.REDIS_PASSWORD = originalPassword;
      }
    });

    it('should handle invalid port number gracefully', async () => {
      const originalPort = process.env.REDIS_PORT;
      process.env.REDIS_PORT = 'invalid';

      connectionStatic.client = null;
      connectionStatic.isConnecting = false;
      mockRedisClient.status = 'ready';

      await RedisConnection.getClient();

      expect(Redis).toHaveBeenCalledWith(
        expect.objectContaining({
          port: NaN,
        })
      );

      if (originalPort) {
        process.env.REDIS_PORT = originalPort;
      } else {
        delete process.env.REDIS_PORT;
      }
    });
  });

  describe('disconnect', () => {
    it('should quit the Redis connection', async () => {
      connectionStatic.client = mockRedisClient;
      await RedisConnection.disconnect();

      expect(mockRedisClient.quit).toHaveBeenCalled();
      expect(connectionStatic.client).toBeNull();
    });

    it('should not fail if no client exists', async () => {
      connectionStatic.client = null;
      await expect(RedisConnection.disconnect()).resolves.not.toThrow();
    });
  });

  describe('healthCheck', () => {
    it('should return true when Redis responds with PONG', async () => {
      connectionStatic.client = mockRedisClient;
      const result = await RedisConnection.healthCheck();

      expect(result).toBe(true);
      expect(mockRedisClient.ping).toHaveBeenCalled();
    });

    it('should return false when Redis ping fails', async () => {
      connectionStatic.client = mockRedisClient;
      mockRedisClient.ping.mockRejectedValue(new Error('Connection failed'));

      const result = await RedisConnection.healthCheck();

      expect(result).toBe(false);
    });

    it('should attempt to create client when no client exists', async () => {
      connectionStatic.client = null;
      connectionStatic.isConnecting = false;
      mockRedisClient.status = 'ready';
      mockRedisClient.ping.mockResolvedValue('PONG');

      const result = await RedisConnection.healthCheck();

      expect(result).toBe(true);
      expect(Redis).toHaveBeenCalled();
    });
  });

  describe('Event Handlers', () => {
    it('should handle connect event', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      connectionStatic.client = null;
      connectionStatic.isConnecting = false;

      let connectHandler: (() => void) | undefined;
      mockRedisClient.on.mockImplementation((event: string, handler: () => void) => {
        if (event === 'connect') {
          connectHandler = handler;
        }
        return mockRedisClient;
      });

      mockRedisClient.status = 'ready';
      await RedisConnection.getClient();

      if (connectHandler) {
        connectHandler();
      }

      expect(consoleLogSpy).toHaveBeenCalledWith('Redis connected successfully');
      expect(connectionStatic.isConnecting).toBe(false);

      consoleLogSpy.mockRestore();
    });

    it('should handle error event', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      connectionStatic.client = null;
      connectionStatic.isConnecting = false;

      let errorHandler: ((error: Error) => void) | undefined;
      mockRedisClient.on.mockImplementation((event: string, handler: (error: Error) => void) => {
        if (event === 'error') {
          errorHandler = handler;
        }
        return mockRedisClient;
      });

      mockRedisClient.status = 'ready';
      await RedisConnection.getClient();

      if (errorHandler) {
        errorHandler(new Error('Connection failed'));
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith('Redis connection error:', expect.any(Error));
      expect(connectionStatic.isConnecting).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it('should handle close event', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      connectionStatic.client = null;
      connectionStatic.isConnecting = false;

      let closeHandler: (() => void) | undefined;
      mockRedisClient.on.mockImplementation((event: string, handler: () => void) => {
        if (event === 'close') {
          closeHandler = handler;
        }
        return mockRedisClient;
      });

      mockRedisClient.status = 'ready';
      await RedisConnection.getClient();

      connectionStatic.client = mockRedisClient;

      if (closeHandler) {
        closeHandler();
      }

      expect(consoleLogSpy).toHaveBeenCalledWith('Redis connection closed');
      expect(connectionStatic.client).toBeNull();

      consoleLogSpy.mockRestore();
    });

    it('should handle connection error during client creation', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const testError = new Error('Failed to create Redis connection');

      (Redis as unknown as jest.Mock).mockImplementation(() => {
        throw testError;
      });

      connectionStatic.client = null;
      connectionStatic.isConnecting = false;

      await expect(RedisConnection.getClient()).rejects.toThrow(testError);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create Redis connection:', testError);
      expect(connectionStatic.isConnecting).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it('should handle retry strategy logging for various attempt counts', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      connectionStatic.client = null;
      connectionStatic.isConnecting = false;
      mockRedisClient.status = 'ready';

      await RedisConnection.getClient();
      const retryStrategy = (Redis as unknown as jest.Mock).mock.calls[0][0].retryStrategy;

      retryStrategy(1);
      retryStrategy(2);
      retryStrategy(3);
      retryStrategy(5);
      retryStrategy(10);
      retryStrategy(40);

      expect(consoleLogSpy).toHaveBeenCalledWith('Redis reconnecting attempt 1 in 50ms');
      expect(consoleLogSpy).toHaveBeenCalledWith('Redis reconnecting attempt 2 in 100ms');
      expect(consoleLogSpy).toHaveBeenCalledWith('Redis reconnecting attempt 3 in 150ms');
      expect(consoleLogSpy).toHaveBeenCalledWith('Redis reconnecting attempt 5 in 250ms');
      expect(consoleLogSpy).toHaveBeenCalledWith('Redis reconnecting attempt 10 in 500ms');
      expect(consoleLogSpy).toHaveBeenCalledWith('Redis reconnecting attempt 40 in 2000ms');

      consoleLogSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle getClient when client status changes during wait', async () => {
      connectionStatic.client = null;
      connectionStatic.isConnecting = false;

      let status = 'connecting';
      const changingClient = {
        status,
        on: jest.fn(),
        ping: jest.fn(),
        quit: jest.fn(),
      } as unknown as jest.Mocked<Redis>;

      Object.defineProperty(changingClient, 'status', {
        get: () => status,
        set: (val: string) => {
          status = val;
        },
      });

      (Redis as unknown as jest.Mock).mockImplementation(() => changingClient);

      const promise = RedisConnection.getClient();

      setTimeout(() => {
        status = 'ready';
      }, 200);

      jest.advanceTimersByTime(300);

      const client = await promise;
      expect(client).toBe(changingClient);
    });

    it('should handle health check when client creation fails', async () => {
      (Redis as unknown as jest.Mock).mockImplementation(() => {
        throw new Error('Connection failed');
      });

      connectionStatic.client = null;
      connectionStatic.isConnecting = false;

      const result = await RedisConnection.healthCheck();

      expect(result).toBe(false);
    });
  });
});
