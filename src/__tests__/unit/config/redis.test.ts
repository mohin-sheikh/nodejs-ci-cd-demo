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

    it('should handle retry strategy correctly', async () => {
      connectionStatic.client = null;
      connectionStatic.isConnecting = false;
      mockRedisClient.status = 'ready';

      await RedisConnection.getClient();
      const retryStrategy = (Redis as unknown as jest.Mock).mock.calls[0][0].retryStrategy;

      expect(retryStrategy(1)).toBe(50);
      expect(retryStrategy(2)).toBe(100);
      expect(retryStrategy(3)).toBe(150);
      expect(retryStrategy(40)).toBe(2000);
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
});
