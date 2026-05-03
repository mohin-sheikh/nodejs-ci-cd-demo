import { Request, Response, NextFunction } from 'express';
import {
  rateLimit,
  loginRateLimit,
  apiRateLimit,
  strictRateLimit,
} from '../../../api/middlewares/rateLimit.middleware';
import RedisService from '../../../services/redis.service';

jest.mock('../../../services/redis.service');

describe('Rate Limit Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let mockSetHeader: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      ip: '127.0.0.1',
      path: '/api/test',
    };

    mockSetHeader = jest.fn();
    mockResponse = {
      setHeader: mockSetHeader,
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();

    (RedisService.incr as jest.Mock).mockResolvedValue(1);
    (RedisService.expire as jest.Mock).mockResolvedValue(undefined);
    (RedisService.ttl as jest.Mock).mockResolvedValue(60);
  });

  describe('rateLimit', () => {
    it('should allow request when under limit', async () => {
      (RedisService.incr as jest.Mock).mockResolvedValue(5);
      (RedisService.ttl as jest.Mock).mockResolvedValue(30);

      const middleware = rateLimit({ windowSeconds: 60, maxRequests: 10 });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(RedisService.incr).toHaveBeenCalledWith('ratelimit:127.0.0.1:/api/test');
      expect(RedisService.expire).toHaveBeenCalledTimes(0);
      expect(mockSetHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 10);
      expect(mockSetHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 5);
      expect(mockSetHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(Number));
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should set expiration on first request', async () => {
      (RedisService.incr as jest.Mock).mockResolvedValue(1);

      const middleware = rateLimit({ windowSeconds: 60, maxRequests: 10 });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(RedisService.expire).toHaveBeenCalledWith('ratelimit:127.0.0.1:/api/test', 60);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should block request when over limit', async () => {
      (RedisService.incr as jest.Mock).mockResolvedValue(11);
      (RedisService.ttl as jest.Mock).mockResolvedValue(45);

      const middleware = rateLimit({ windowSeconds: 60, maxRequests: 10 });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 429,
        message: 'Too many requests. Please try again in 45 seconds.',
        data: {},
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should use default config when no config provided', async () => {
      (RedisService.incr as jest.Mock).mockResolvedValue(101);

      const middleware = rateLimit();
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockSetHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 100);
    });

    it('should continue to next on Redis error', async () => {
      (RedisService.incr as jest.Mock).mockRejectedValue(new Error('Redis connection failed'));

      const middleware = rateLimit();
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('loginRateLimit', () => {
    it('should have 5 max requests per 15 minutes', async () => {
      (RedisService.incr as jest.Mock).mockResolvedValue(5);
      (RedisService.ttl as jest.Mock).mockResolvedValue(800);

      await loginRateLimit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockSetHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 5);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should block after 5 attempts', async () => {
      (RedisService.incr as jest.Mock).mockResolvedValue(6);

      await loginRateLimit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('apiRateLimit', () => {
    it('should have 100 max requests per minute', async () => {
      (RedisService.incr as jest.Mock).mockResolvedValue(50);

      await apiRateLimit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockSetHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 100);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should block after 100 requests', async () => {
      (RedisService.incr as jest.Mock).mockResolvedValue(101);

      await apiRateLimit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('strictRateLimit', () => {
    it('should have 10 max requests per hour', async () => {
      (RedisService.incr as jest.Mock).mockResolvedValue(5);

      await strictRateLimit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockSetHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 10);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should block after 10 requests', async () => {
      (RedisService.incr as jest.Mock).mockResolvedValue(11);

      await strictRateLimit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should calculate remaining correctly', async () => {
      (RedisService.incr as jest.Mock).mockResolvedValue(3);
      (RedisService.ttl as jest.Mock).mockResolvedValue(50);

      const middleware = rateLimit({ maxRequests: 10 });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockSetHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 7);
    });

    it('should handle negative remaining correctly', async () => {
      (RedisService.incr as jest.Mock).mockResolvedValue(15);
      (RedisService.ttl as jest.Mock).mockResolvedValue(30);

      const middleware = rateLimit({ maxRequests: 10 });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockSetHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 0);
    });
  });
});
