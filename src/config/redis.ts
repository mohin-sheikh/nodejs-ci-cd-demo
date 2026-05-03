import Redis from 'ioredis';

class RedisConnection {
  private static client: Redis | null = null;
  private static isConnecting = false;

  static async getClient(): Promise<Redis> {
    if (this.client && this.client.status === 'ready') {
      return this.client;
    }

    if (this.isConnecting) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return this.getClient();
    }

    this.isConnecting = true;

    try {
      this.client = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          console.log(`Redis reconnecting attempt ${times} in ${delay}ms`);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      this.client.on('connect', () => {
        console.log('Redis connected successfully');
        this.isConnecting = false;
      });

      this.client.on('error', (error) => {
        console.error('Redis connection error:', error);
        this.isConnecting = false;
      });

      this.client.on('close', () => {
        console.log('Redis connection closed');
        this.client = null;
      });

      await this.waitForConnection();
      return this.client;
    } catch (error) {
      this.isConnecting = false;
      console.error('Failed to create Redis connection:', error);
      throw error;
    }
  }

  private static async waitForConnection(timeout = 5000): Promise<void> {
    const startTime = Date.now();
    while (this.client && this.client.status !== 'ready') {
      if (Date.now() - startTime > timeout) {
        throw new Error('Redis connection timeout');
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  static async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const client = await this.getClient();
      const result = await client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }
}

export default RedisConnection;
