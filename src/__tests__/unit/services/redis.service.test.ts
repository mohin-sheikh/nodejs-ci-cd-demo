import Redis from 'ioredis';
import RedisConnection from '../../../config/redis';
import redisService from '../../../services/redis.service';

interface RedisServiceWithClient {
  client: Redis | null;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
  hset(key: string, field: string, value: unknown): Promise<void>;
  hget<T>(key: string, field: string): Promise<T | null>;
  hdel(key: string, field: string): Promise<void>;
  hgetall<T>(key: string): Promise<Record<string, T>>;
  sadd(key: string, ...members: string[]): Promise<void>;
  srem(key: string, ...members: string[]): Promise<void>;
  smembers(key: string): Promise<string[]>;
  sismember(key: string, member: string): Promise<boolean>;
}

jest.mock('ioredis');
jest.mock('../../../config/redis');

describe('RedisService', () => {
  let mockRedisClient: jest.Mocked<Redis>;
  let serviceWithClient: RedisServiceWithClient;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRedisClient = {
      set: jest.fn().mockResolvedValue('OK'),
      setex: jest.fn().mockResolvedValue('OK'),
      get: jest.fn(),
      del: jest.fn().mockResolvedValue(1),
      exists: jest.fn().mockResolvedValue(1),
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
      ttl: jest.fn().mockResolvedValue(60),
      hset: jest.fn().mockResolvedValue(1),
      hget: jest.fn(),
      hdel: jest.fn().mockResolvedValue(1),
      hgetall: jest.fn(),
      sadd: jest.fn().mockResolvedValue(1),
      srem: jest.fn().mockResolvedValue(1),
      smembers: jest.fn(),
      sismember: jest.fn().mockResolvedValue(1),
    } as unknown as jest.Mocked<Redis>;

    (RedisConnection.getClient as jest.Mock).mockResolvedValue(mockRedisClient);

    serviceWithClient = redisService as unknown as RedisServiceWithClient;
    serviceWithClient.client = null;
  });

  describe('set', () => {
    it('should set a string value without TTL', async () => {
      await redisService.set('key', 'value');

      expect(mockRedisClient.set).toHaveBeenCalledWith('key', 'value');
      expect(mockRedisClient.setex).not.toHaveBeenCalled();
    });

    it('should set an object value as JSON without TTL', async () => {
      const obj = { name: 'test', value: 123 };
      await redisService.set('key', obj);

      expect(mockRedisClient.set).toHaveBeenCalledWith('key', JSON.stringify(obj));
    });

    it('should set a value with TTL using setex', async () => {
      await redisService.set('key', 'value', 60);

      expect(mockRedisClient.setex).toHaveBeenCalledWith('key', 60, 'value');
      expect(mockRedisClient.set).not.toHaveBeenCalled();
    });

    it('should set an object with TTL', async () => {
      const obj = { name: 'test', value: 123 };
      await redisService.set('key', obj, 60);

      expect(mockRedisClient.setex).toHaveBeenCalledWith('key', 60, JSON.stringify(obj));
    });

    it('should handle number values', async () => {
      await redisService.set('key', 123);

      expect(mockRedisClient.set).toHaveBeenCalledWith('key', '123');
    });

    it('should handle boolean values', async () => {
      await redisService.set('key', true);

      expect(mockRedisClient.set).toHaveBeenCalledWith('key', 'true');
    });
  });

  describe('get', () => {
    it('should return parsed JSON when value is JSON string', async () => {
      const obj = { name: 'test', value: 123 };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(obj));

      const result = await redisService.get('key');

      expect(result).toEqual(obj);
      expect(mockRedisClient.get).toHaveBeenCalledWith('key');
    });

    it('should return string value when value is not JSON', async () => {
      mockRedisClient.get.mockResolvedValue('simple string');

      const result = await redisService.get('key');

      expect(result).toBe('simple string');
    });

    it('should return null when key does not exist', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await redisService.get('key');

      expect(result).toBeNull();
    });

    it('should handle numeric values as string', async () => {
      mockRedisClient.get.mockResolvedValue('123');

      const result = await redisService.get('key');

      expect(result).toBe(123);
    });

    it('should handle invalid JSON gracefully', async () => {
      mockRedisClient.get.mockResolvedValue('invalid{json');

      const result = await redisService.get('key');

      expect(result).toBe('invalid{json');
    });

    it('should return typed data with generic', async () => {
      interface User {
        id: number;
        name: string;
      }
      const user: User = { id: 1, name: 'John' };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(user));

      const result = await redisService.get<User>('user:1');

      expect(result).toEqual(user);
      expect(result?.id).toBe(1);
      expect(result?.name).toBe('John');
    });
  });

  describe('del', () => {
    it('should delete a key', async () => {
      await redisService.del('key');

      expect(mockRedisClient.del).toHaveBeenCalledWith('key');
    });
  });

  describe('exists', () => {
    it('should return true when key exists', async () => {
      mockRedisClient.exists.mockResolvedValue(1);

      const result = await redisService.exists('key');

      expect(result).toBe(true);
      expect(mockRedisClient.exists).toHaveBeenCalledWith('key');
    });

    it('should return false when key does not exist', async () => {
      mockRedisClient.exists.mockResolvedValue(0);

      const result = await redisService.exists('key');

      expect(result).toBe(false);
    });
  });

  describe('incr', () => {
    it('should increment a key and return new value', async () => {
      mockRedisClient.incr.mockResolvedValue(5);

      const result = await redisService.incr('counter');

      expect(result).toBe(5);
      expect(mockRedisClient.incr).toHaveBeenCalledWith('counter');
    });
  });

  describe('expire', () => {
    it('should set expiration on a key', async () => {
      await redisService.expire('key', 60);

      expect(mockRedisClient.expire).toHaveBeenCalledWith('key', 60);
    });
  });

  describe('ttl', () => {
    it('should return TTL of a key', async () => {
      mockRedisClient.ttl.mockResolvedValue(120);

      const result = await redisService.ttl('key');

      expect(result).toBe(120);
      expect(mockRedisClient.ttl).toHaveBeenCalledWith('key');
    });
  });

  describe('hset', () => {
    it('should set a hash field with string value', async () => {
      await redisService.hset('hash', 'field', 'value');

      expect(mockRedisClient.hset).toHaveBeenCalledWith('hash', 'field', 'value');
    });

    it('should set a hash field with object value as JSON', async () => {
      const obj = { name: 'test', value: 123 };
      await redisService.hset('hash', 'field', obj);

      expect(mockRedisClient.hset).toHaveBeenCalledWith('hash', 'field', JSON.stringify(obj));
    });

    it('should set a hash field with number value', async () => {
      await redisService.hset('hash', 'field', 123);

      expect(mockRedisClient.hset).toHaveBeenCalledWith('hash', 'field', '123');
    });
  });

  describe('hget', () => {
    it('should return parsed JSON for hash field', async () => {
      const obj = { name: 'test', value: 123 };
      mockRedisClient.hget.mockResolvedValue(JSON.stringify(obj));

      const result = await redisService.hget('hash', 'field');

      expect(result).toEqual(obj);
      expect(mockRedisClient.hget).toHaveBeenCalledWith('hash', 'field');
    });

    it('should return string value for hash field when not JSON', async () => {
      mockRedisClient.hget.mockResolvedValue('simple string');

      const result = await redisService.hget('hash', 'field');

      expect(result).toBe('simple string');
    });

    it('should return null when hash field does not exist', async () => {
      mockRedisClient.hget.mockResolvedValue(null);

      const result = await redisService.hget('hash', 'field');

      expect(result).toBeNull();
    });

    it('should handle invalid JSON in hash field', async () => {
      mockRedisClient.hget.mockResolvedValue('invalid{json');

      const result = await redisService.hget('hash', 'field');

      expect(result).toBe('invalid{json');
    });
  });

  describe('hdel', () => {
    it('should delete a hash field', async () => {
      await redisService.hdel('hash', 'field');

      expect(mockRedisClient.hdel).toHaveBeenCalledWith('hash', 'field');
    });
  });

  describe('hgetall', () => {
    it('should return all hash fields with parsed JSON values', async () => {
      const hashData = {
        field1: JSON.stringify({ name: 'test1' }),
        field2: JSON.stringify({ name: 'test2' }),
        field3: 'plain string',
      };
      mockRedisClient.hgetall.mockResolvedValue(hashData);

      const result = await redisService.hgetall('hash');

      expect(result).toEqual({
        field1: { name: 'test1' },
        field2: { name: 'test2' },
        field3: 'plain string',
      });
      expect(mockRedisClient.hgetall).toHaveBeenCalledWith('hash');
    });

    it('should return empty object when hash is empty', async () => {
      mockRedisClient.hgetall.mockResolvedValue({});

      const result = await redisService.hgetall('hash');

      expect(result).toEqual({});
    });

    it('should handle mixed JSON and non-JSON values', async () => {
      const hashData = {
        jsonField: JSON.stringify({ id: 1 }),
        stringField: 'simple',
        numberField: '123',
      };
      mockRedisClient.hgetall.mockResolvedValue(hashData);

      const result = await redisService.hgetall('hash');

      expect(result).toEqual({
        jsonField: { id: 1 },
        stringField: 'simple',
        numberField: 123,
      });
    });
  });

  describe('sadd', () => {
    it('should add single member to set', async () => {
      await redisService.sadd('set', 'member1');

      expect(mockRedisClient.sadd).toHaveBeenCalledWith('set', 'member1');
    });

    it('should add multiple members to set', async () => {
      await redisService.sadd('set', 'member1', 'member2', 'member3');

      expect(mockRedisClient.sadd).toHaveBeenCalledWith('set', 'member1', 'member2', 'member3');
    });
  });

  describe('srem', () => {
    it('should remove single member from set', async () => {
      await redisService.srem('set', 'member1');

      expect(mockRedisClient.srem).toHaveBeenCalledWith('set', 'member1');
    });

    it('should remove multiple members from set', async () => {
      await redisService.srem('set', 'member1', 'member2');

      expect(mockRedisClient.srem).toHaveBeenCalledWith('set', 'member1', 'member2');
    });
  });

  describe('smembers', () => {
    it('should return all members of a set', async () => {
      const members = ['member1', 'member2', 'member3'];
      mockRedisClient.smembers.mockResolvedValue(members);

      const result = await redisService.smembers('set');

      expect(result).toEqual(members);
      expect(mockRedisClient.smembers).toHaveBeenCalledWith('set');
    });

    it('should return empty array when set does not exist', async () => {
      mockRedisClient.smembers.mockResolvedValue([]);

      const result = await redisService.smembers('set');

      expect(result).toEqual([]);
    });
  });

  describe('sismember', () => {
    it('should return true when member exists in set', async () => {
      mockRedisClient.sismember.mockResolvedValue(1);

      const result = await redisService.sismember('set', 'member');

      expect(result).toBe(true);
      expect(mockRedisClient.sismember).toHaveBeenCalledWith('set', 'member');
    });

    it('should return false when member does not exist in set', async () => {
      mockRedisClient.sismember.mockResolvedValue(0);

      const result = await redisService.sismember('set', 'member');

      expect(result).toBe(false);
    });
  });

  describe('Client Management', () => {
    it('should reuse existing client', async () => {
      await redisService.set('key1', 'value1');
      expect(RedisConnection.getClient).toHaveBeenCalledTimes(1);

      await redisService.set('key2', 'value2');
      expect(RedisConnection.getClient).toHaveBeenCalledTimes(1);
    });

    it('should handle getClient when client is not set', async () => {
      serviceWithClient.client = null;
      (RedisConnection.getClient as jest.Mock).mockResolvedValue(mockRedisClient);

      await redisService.set('key', 'value');

      expect(RedisConnection.getClient).toHaveBeenCalled();
      expect(mockRedisClient.set).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should propagate Redis errors', async () => {
      const error = new Error('Redis connection failed');
      mockRedisClient.set.mockRejectedValue(error);

      await expect(redisService.set('key', 'value')).rejects.toThrow('Redis connection failed');
    });

    it('should handle getClient failure', async () => {
      const error = new Error('Failed to get Redis client');
      (RedisConnection.getClient as jest.Mock).mockRejectedValue(error);
      serviceWithClient.client = null;

      await expect(redisService.get('key')).rejects.toThrow('Failed to get Redis client');
    });
  });
});
