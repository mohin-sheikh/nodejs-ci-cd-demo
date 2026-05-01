import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../../../api/controllers/auth.controller';
import { AuthService } from '../../../services/auth.service';

const mockAuthService = {
  login: jest.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  const mockDate = new Date();
  const mockLoginResponse = {
    user: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'john@example.com',
      isActive: true,
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      body: {},
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

    it('should return user data with status 200 when login is successful', async () => {
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
});
