import { Request, Response, NextFunction } from 'express';
import RedisService from '../../services/redis.service';
import { ResponseHandler } from '../../utils/response';

interface RateLimitConfig {
  windowSeconds: number;
  maxRequests: number;
}

const defaultConfig: RateLimitConfig = {
  windowSeconds: 60,
  maxRequests: 100,
};

export const rateLimit = (config: Partial<RateLimitConfig> = {}) => {
  const { windowSeconds, maxRequests } = { ...defaultConfig, ...config };

  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `ratelimit:${req.ip}:${req.path}`;

    try {
      const current = await RedisService.incr(key);

      if (current === 1) {
        await RedisService.expire(key, windowSeconds);
      }

      const ttl = await RedisService.ttl(key);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));
      res.setHeader('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + ttl);

      if (current > maxRequests) {
        return ResponseHandler.error(
          res,
          `Too many requests. Please try again in ${ttl} seconds.`,
          429
        );
      }

      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      next();
    }
  };
};

export const loginRateLimit = rateLimit({
  windowSeconds: 900, // 15 minutes
  maxRequests: 5,
});

export const apiRateLimit = rateLimit({
  windowSeconds: 60, // 1 minute
  maxRequests: 100,
});

export const strictRateLimit = rateLimit({
  windowSeconds: 3600, // 1 hour
  maxRequests: 10,
});
