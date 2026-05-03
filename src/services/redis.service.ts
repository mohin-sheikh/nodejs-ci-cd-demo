import Redis from 'ioredis';
import RedisConnection from '../config/redis';

export class RedisService {
  private client: Redis | null = null;

  private async getClient(): Promise<Redis> {
    if (!this.client) {
      this.client = await RedisConnection.getClient();
    }
    return this.client;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const client = await this.getClient();
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, stringValue);
    } else {
      await client.set(key, stringValue);
    }
  }

  async get<T = Record<string, unknown>>(key: string): Promise<T | null> {
    const client = await this.getClient();
    const value = await client.get(key);

    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async del(key: string): Promise<void> {
    const client = await this.getClient();
    await client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const client = await this.getClient();
    const result = await client.exists(key);
    return result === 1;
  }

  async incr(key: string): Promise<number> {
    const client = await this.getClient();
    return client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    const client = await this.getClient();
    await client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    const client = await this.getClient();
    return client.ttl(key);
  }

  async hset(key: string, field: string, value: unknown): Promise<void> {
    const client = await this.getClient();
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await client.hset(key, field, stringValue);
  }

  async hget<T = Record<string, unknown>>(key: string, field: string): Promise<T | null> {
    const client = await this.getClient();
    const value = await client.hget(key, field);

    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async hdel(key: string, field: string): Promise<void> {
    const client = await this.getClient();
    await client.hdel(key, field);
  }

  async hgetall<T = Record<string, unknown>>(key: string): Promise<Record<string, T>> {
    const client = await this.getClient();
    const result = await client.hgetall(key);

    const parsed: Record<string, T> = {};
    for (const [field, value] of Object.entries(result)) {
      try {
        parsed[field] = JSON.parse(value) as T;
      } catch {
        parsed[field] = value as unknown as T;
      }
    }
    return parsed;
  }

  async sadd(key: string, ...members: string[]): Promise<void> {
    const client = await this.getClient();
    await client.sadd(key, ...members);
  }

  async srem(key: string, ...members: string[]): Promise<void> {
    const client = await this.getClient();
    await client.srem(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    const client = await this.getClient();
    return client.smembers(key);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    const client = await this.getClient();
    const result = await client.sismember(key, member);
    return result === 1;
  }
}

export default new RedisService();
