import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../../api/middlewares/error.middleware';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;

    mockRequest = {};

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('When error is "User with this email already exists"', () => {
    it('should return 409 status with error message', () => {
      const error = new Error('User with this email already exists');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'User with this email already exists',
        statusCode: 409,
        error: 'User with this email already exists',
        data: {},
      });
    });

    it('should not call next', () => {
      const error = new Error('User with this email already exists');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('When error is "User not found"', () => {
    it('should return 404 status with error message', () => {
      const error = new Error('User not found');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
        statusCode: 404,
        error: 'User not found',
        data: {},
      });
    });

    it('should not call next', () => {
      const error = new Error('User not found');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('When error is a generic error', () => {
    const genericError = new Error('Something went wrong');

    describe('In development environment', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'development';
      });

      it('should return 500 status with generic error message and stack trace', () => {
        errorHandler(genericError, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
        expect(responseCall).toMatchObject({
          success: false,
          message: 'Internal server error',
          statusCode: 500,
          error: 'Internal server error',
          data: {},
        });
        expect(responseCall.details).toBeDefined();
        expect(responseCall.details.stack).toBeDefined();
      });

      it('should not call next', () => {
        errorHandler(genericError, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe('In production environment', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'production';
      });

      it('should return 500 status without exposing error details', () => {
        errorHandler(genericError, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Internal server error',
          statusCode: 500,
          error: 'Internal server error',
          data: {},
        });
      });
    });

    describe('In test environment', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'test';
      });

      it('should return 500 status without exposing error details', () => {
        errorHandler(genericError, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Internal server error',
          statusCode: 500,
          error: 'Internal server error',
          data: {},
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle error without a message', () => {
      const error = new Error();
      error.message = '';

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        statusCode: 500,
        error: 'Internal server error',
        data: {},
      });
    });

    it('should preserve the exact error message for known errors regardless of environment', () => {
      const emailError = new Error('User with this email already exists');
      const notFoundError = new Error('User not found');

      process.env.NODE_ENV = 'production';

      errorHandler(emailError, mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'User with this email already exists',
        statusCode: 409,
        error: 'User with this email already exists',
        data: {},
      });

      errorHandler(notFoundError, mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
        statusCode: 404,
        error: 'User not found',
        data: {},
      });
    });
  });

  describe('Response Structure', () => {
    it('should always return a JSON response', () => {
      const error = new Error('Any error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalled();
      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(typeof response).toBe('object');
      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('statusCode');
    });
  });
});
