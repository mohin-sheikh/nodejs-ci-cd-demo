import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../../../api/controllers/auth.controller';
import { AuthService } from '../../../services/auth.service';
import { TokenPayload } from '../../../services/jwt.service';

const mockAuthService = {
  login: jest.fn(),
  refreshToken: jest.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;
  let mockRequest: Partial<Request> & { user?: TokenPayload };
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  const mockDate = new Date();
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    email: 'john@example.com',
    isActive: true,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: '7d',
  };

  const mockLoginResponse = {
    user: mockUser,
    tokens: mockTokens,
  };

  const mockRefreshTokenResponse = {
    accessToken: 'new-access-token',
    refreshToken: 'new-refresh-token',
    expiresIn: '7d',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      body: {},
      user: undefined,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    authController = new AuthController(mockAuthService as unknown as AuthService);
  });

  describe('login', () => {
    const loginData = {
      email: 'john@example.com',
      password: 'Test@123456',
    };

    beforeEach(() => {
      mockRequest.body = loginData;
    });

    it('should return user data with tokens when login is successful', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      await authController.login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginData.email, loginData.password);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Login successful',
        statusCode: 200,
        data: mockLoginResponse,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when login fails (invalid credentials)', async () => {
      mockAuthService.login.mockResolvedValue(null);

      await authController.login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginData.email, loginData.password);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid email or password',
        statusCode: 401,
        data: {},
      });
    });

    it('should call next with error when service throws an error', async () => {
      const error = new Error('Database error');
      mockAuthService.login.mockRejectedValue(error);

      await authController.login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginData.email, loginData.password);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    const refreshTokenData = {
      refreshToken: 'valid-refresh-token',
    };

    beforeEach(() => {
      mockRequest.body = refreshTokenData;
    });

    it('should return new tokens when refresh token is valid', async () => {
      mockAuthService.refreshToken.mockResolvedValue(mockRefreshTokenResponse);

      await authController.refreshToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshTokenData.refreshToken);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Token refreshed successfully',
        statusCode: 200,
        data: { tokens: mockRefreshTokenResponse },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when refresh token is missing', async () => {
      mockRequest.body = {};

      await authController.refreshToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAuthService.refreshToken).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Refresh token is required',
        statusCode: 400,
        data: {},
      });
    });

    it('should return 401 when refresh token is invalid', async () => {
      mockAuthService.refreshToken.mockResolvedValue(null);

      await authController.refreshToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshTokenData.refreshToken);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid or expired refresh token',
        statusCode: 401,
        data: {},
      });
    });

    it('should call next with error when service throws an error', async () => {
      const error = new Error('Database error');
      mockAuthService.refreshToken.mockRejectedValue(error);

      await authController.refreshToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshTokenData.refreshToken);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when authenticated', async () => {
      mockRequest.user = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      };

      await authController.getCurrentUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Current user retrieved',
        statusCode: 200,
        data: { user: mockRequest.user },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await authController.getCurrentUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not authenticated',
        statusCode: 401,
        data: {},
      });
    });

    it('should call next with error when an unexpected error occurs', async () => {
      const error = new Error('Unexpected error');
      const originalJson = mockResponse.json;
      mockResponse.json = jest.fn().mockImplementation(() => {
        throw error;
      });

      mockRequest.user = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      };

      await authController.getCurrentUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);

      mockResponse.json = originalJson;
    });
  });
});
