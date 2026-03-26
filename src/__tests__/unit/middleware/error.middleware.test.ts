import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../../api/middlewares/error.middleware';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    // Store original NODE_ENV
    originalNodeEnv = process.env.NODE_ENV;

    // Setup mock request
    mockRequest = {};

    // Setup mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Setup mock next
    mockNext = jest.fn();
  });

  afterEach(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('When error is "User with this email already exists"', () => {
    it('should return 409 status with error message', () => {
      const error = new Error('User with this email already exists');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User with this email already exists',
      });
    });

    it('should not call next', () => {
      const error = new Error('User with this email already exists');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should not include additional message', () => {
      const error = new Error('User with this email already exists');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseCall.message).toBeUndefined();
    });
  });

  describe('When error is "User not found"', () => {
    it('should return 404 status with error message', () => {
      const error = new Error('User not found');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User not found',
      });
    });

    it('should not call next', () => {
      const error = new Error('User not found');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should not include additional message', () => {
      const error = new Error('User not found');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseCall.message).toBeUndefined();
    });
  });

  describe('When error is a generic error', () => {
    const genericError = new Error('Something went wrong');

    describe('In development environment', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'development';
      });

      it('should return 500 status with generic error message', () => {
        errorHandler(genericError, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          error: 'Internal server error',
          message: 'Something went wrong',
        });
      });

      it('should not call next', () => {
        errorHandler(genericError, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should include the error message in response', () => {
        errorHandler(genericError, mockRequest as Request, mockResponse as Response, mockNext);

        const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
        expect(responseCall.message).toBe('Something went wrong');
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
          error: 'Internal server error',
          message: undefined,
        });
      });

      it('should not expose error message to client', () => {
        errorHandler(genericError, mockRequest as Request, mockResponse as Response, mockNext);

        const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
        expect(responseCall.message).toBeUndefined();
      });
    });

    describe('In test environment', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'test';
      });

      it('should return 500 status without exposing error details (test env treated like production)', () => {
        errorHandler(genericError, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          error: 'Internal server error',
          message: undefined,
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
        error: 'Internal server error',
        message: undefined,
      });
    });

    it('should handle errors with special characters in message', () => {
      const error = new Error('User with special chars: !@#$%^&*()');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message:
          process.env.NODE_ENV === 'development'
            ? 'User with special chars: !@#$%^&*()'
            : undefined,
      });
    });

    it('should handle error with long message', () => {
      const longMessage = 'A'.repeat(1000);
      const error = new Error(longMessage);

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      if (process.env.NODE_ENV === 'development') {
        expect(responseCall.message).toBe(longMessage);
      } else {
        expect(responseCall.message).toBeUndefined();
      }
    });

    it('should preserve the exact error message for known errors regardless of environment', () => {
      const emailError = new Error('User with this email already exists');
      const notFoundError = new Error('User not found');

      process.env.NODE_ENV = 'production';

      errorHandler(emailError, mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User with this email already exists',
      });

      errorHandler(notFoundError, mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User not found',
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
      expect(response).toHaveProperty('error');
    });

    it('should not expose stack traces', () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.stack).toBeUndefined();
    });
  });
});
