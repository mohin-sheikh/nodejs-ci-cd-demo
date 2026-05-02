import { Request, Response, NextFunction } from 'express';
import {
  authenticate,
  optionalAuth,
  requireActiveUser,
} from '../../../api/middlewares/auth.middleware';
import { JWTService } from '../../../services/jwt.service';

jest.mock('../../../services/jwt.service');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      headers: {},
      user: undefined,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('authenticate', () => {
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      name: 'Test User',
    };

    it('should set user and call next for valid token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };
      (JWTService.verifyAccessToken as jest.Mock).mockReturnValue(mockUser);

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(JWTService.verifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 when no token provided', async () => {
      mockRequest.headers = {};

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'No token provided. Please login first.',
        statusCode: 401,
        data: {},
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header does not start with Bearer', async () => {
      mockRequest.headers = {
        authorization: 'Basic token',
      };

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'No token provided. Please login first.',
        statusCode: 401,
        data: {},
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is expired', async () => {
      mockRequest.headers = {
        authorization: 'Bearer expired-token',
      };
      (JWTService.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token expired');
      });

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Token expired. Please login again.',
        statusCode: 401,
        data: {},
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };
      (JWTService.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid token. Please login again.',
        statusCode: 401,
        data: {},
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return generic error for unknown verification errors', async () => {
      mockRequest.headers = {
        authorization: 'Bearer some-token',
      };
      (JWTService.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Unknown error');
      });

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unknown error',
        statusCode: 401,
        data: {},
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      name: 'Test User',
    };

    it('should set user and call next for valid token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };
      (JWTService.verifyAccessToken as jest.Mock).mockReturnValue(mockUser);

      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(JWTService.verifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next without setting user when no token provided', async () => {
      mockRequest.headers = {};

      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next without setting user when token is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };
      (JWTService.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next without setting user when token is expired', async () => {
      mockRequest.headers = {
        authorization: 'Bearer expired-token',
      };
      (JWTService.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token expired');
      });

      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireActiveUser', () => {
    it('should call next when user exists', async () => {
      mockRequest.user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'Test User',
      };

      await requireActiveUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 when user does not exist', async () => {
      mockRequest.user = undefined;

      await requireActiveUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Authentication required',
        statusCode: 401,
        data: {},
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
