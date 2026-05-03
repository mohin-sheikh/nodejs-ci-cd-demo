import { Request, Response, NextFunction } from 'express';
import { requestLogger } from '../../../api/middlewares/logger.middleware';

type JsonFunction = (body: unknown) => Response;

describe('Logger Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let consoleLogSpy: jest.SpyInstance;
  let originalJson: JsonFunction;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    mockRequest = {
      method: 'GET',
      url: '/test',
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      statusCode: 200,
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    originalJson = mockResponse.json as JsonFunction;
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should skip logging for favicon requests', () => {
    mockRequest.url = '/favicon.ico';

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should log request received', () => {
    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    expect(consoleLogSpy).toHaveBeenCalledWith('GET /test - Request received');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should replace response.json method', () => {
    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.json).not.toBe(originalJson);
  });

  it('should log response status and duration when json is called', () => {
    const originalDateNow = Date.now;
    const mockStartTime = 1000000;
    const mockEndTime = 1000100;

    let callCount = 0;
    Date.now = jest.fn(() => {
      callCount++;
      if (callCount === 1) return mockStartTime;
      return mockEndTime;
    });

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    const responseBody = { test: 'data' };
    (mockResponse.json as JsonFunction)(responseBody);

    const logCalls = consoleLogSpy.mock.calls;
    const responseLog = logCalls.find(
      (call) => call[0] && call[0].startsWith('GET /test - 200 - ')
    );

    expect(responseLog).toBeDefined();
    expect(responseLog?.[0]).toMatch(/GET \/test - 200 - \d+ms/);

    Date.now = originalDateNow;
  });

  it('should log body for POST requests', () => {
    mockRequest.method = 'POST';
    mockRequest.body = { name: 'Test', password: 'secret123' };

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);
    (mockResponse.json as JsonFunction)({});

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '   Body:',
      JSON.stringify({ name: 'Test', password: '***' })
    );
  });

  it('should log body for PUT requests', () => {
    mockRequest.method = 'PUT';
    mockRequest.body = { name: 'Updated Name' };

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);
    (mockResponse.json as JsonFunction)({});

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '   Body:',
      JSON.stringify({ name: 'Updated Name' })
    );
  });

  it('should mask password in logs', () => {
    mockRequest.method = 'POST';
    mockRequest.body = {
      email: 'test@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    };

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);
    (mockResponse.json as JsonFunction)({});

    const logCall = consoleLogSpy.mock.calls.find((call) => call[0] === '   Body:');
    expect(logCall).toBeDefined();

    const bodyString = logCall?.[1] as string;
    expect(bodyString).toContain('"password":"***"');
    expect(bodyString).not.toContain('"password":"secret123"');
    expect(bodyString).toContain('"email":"test@example.com"');
    expect(bodyString).toContain('"confirmPassword":"secret123"');
  });

  it('should log params when present', () => {
    mockRequest.params = { id: '123' };

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);
    (mockResponse.json as JsonFunction)({});

    expect(consoleLogSpy).toHaveBeenCalledWith('   Params:', { id: '123' });
  });

  it('should log query when present', () => {
    mockRequest.query = { page: '1', limit: '10' };

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);
    (mockResponse.json as JsonFunction)({});

    expect(consoleLogSpy).toHaveBeenCalledWith('   Query:', { page: '1', limit: '10' });
  });

  it('should not log params when empty', () => {
    mockRequest.params = {};

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);
    (mockResponse.json as JsonFunction)({});

    const logCalls = consoleLogSpy.mock.calls;
    const hasParamsLog = logCalls.some((call) => call[0] === '   Params:');
    expect(hasParamsLog).toBe(false);
  });

  it('should not log query when empty', () => {
    mockRequest.query = {};

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);
    (mockResponse.json as JsonFunction)({});

    const logCalls = consoleLogSpy.mock.calls;
    const hasQueryLog = logCalls.some((call) => call[0] === '   Query:');
    expect(hasQueryLog).toBe(false);
  });

  it('should log different HTTP methods correctly', () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    methods.forEach((method) => {
      consoleLogSpy.mockClear();
      mockRequest.method = method;
      mockRequest.url = '/test';

      requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

      expect(consoleLogSpy).toHaveBeenCalledWith(`${method} /test - Request received`);
    });
  });

  it('should handle empty request body', () => {
    mockRequest.method = 'POST';
    mockRequest.body = {};

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);
    (mockResponse.json as JsonFunction)({});

    const logCall = consoleLogSpy.mock.calls.find((call) => call[0] === '   Body:');
    expect(logCall).toBeDefined();
    expect(logCall?.[1]).toBe('{}');
  });

  it('should handle undefined request body', () => {
    mockRequest.method = 'POST';
    mockRequest.body = undefined;

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);
    (mockResponse.json as JsonFunction)({});

    const logCall = consoleLogSpy.mock.calls.find((call) => call[0] === '   Body:');
    expect(logCall).toBeDefined();
    expect(logCall?.[1]).toBe(JSON.stringify({}));
  });

  it('should only mask password at root level (not nested passwords)', () => {
    mockRequest.method = 'POST';
    mockRequest.body = {
      user: {
        email: 'test@example.com',
        password: 'secret123',
        details: {
          oldPassword: 'old123',
        },
      },
    };

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);
    (mockResponse.json as JsonFunction)({});

    const logCall = consoleLogSpy.mock.calls.find((call) => call[0] === '   Body:');
    expect(logCall).toBeDefined();

    const bodyString = logCall?.[1] as string;
    expect(bodyString).toContain('"password":"secret123"');
    expect(bodyString).toContain('"oldPassword":"old123"');
  });

  it('should log response with different status codes', () => {
    mockResponse.statusCode = 404;

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);
    (mockResponse.json as JsonFunction)({});

    const logCalls = consoleLogSpy.mock.calls;
    const responseLog = logCalls.find((call) => call[0] && call[0].includes('GET /test - 404 - '));
    expect(responseLog).toBeDefined();
  });
});
