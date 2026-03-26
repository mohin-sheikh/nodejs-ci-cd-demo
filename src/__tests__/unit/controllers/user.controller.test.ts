import { Request, Response, NextFunction } from 'express';
import { UserController } from '../../../api/controllers/user.controller';

interface MockUserService {
  getAllUsers: jest.Mock;
  getUserById: jest.Mock;
  createUser: jest.Mock;
  updateUser: jest.Mock;
  deleteUser: jest.Mock;
}

jest.mock('../../../services/user.service', () => {
  const mockUserService: MockUserService = {
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  return {
    UserService: jest.fn().mockImplementation(() => mockUserService),
    __esModule: true,
    default: {
      UserService: jest.fn().mockImplementation(() => mockUserService),
    },
  };
});

import { UserService } from '../../../services/user.service';

describe('UserController', () => {
  let userController: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let mockUserService: MockUserService;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed_password',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    const MockUserService = UserService as jest.Mock;
    mockUserService = MockUserService.mock.results[0]?.value || MockUserService();

    jest.clearAllMocks();

    mockRequest = {
      params: {},
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    mockNext = jest.fn();

    userController = new UserController();
  });

  describe('getAllUsers', () => {
    it('should return all users with status 200', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: '2', name: 'Jane Doe' }];
      mockUserService.getAllUsers.mockResolvedValue(mockUsers);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({ users: mockUsers });
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return empty array when no users exist', async () => {
      mockUserService.getAllUsers.mockResolvedValue([]);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({ users: [] });
    });

    it('should call next with error when service fails', async () => {
      const error = new Error('Database error');
      mockUserService.getAllUsers.mockRejectedValue(error);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    const userId = mockUser.id;

    beforeEach(() => {
      mockRequest.params = { id: userId };
    });

    it('should return user when found with status 200', async () => {
      mockUserService.getUserById.mockResolvedValue(mockUser);

      await userController.getUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockResponse.json).toHaveBeenCalledWith({ user: mockUser });
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      mockUserService.getUserById.mockResolvedValue(null);

      await userController.getUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should call next with error when service fails', async () => {
      const error = new Error('Database error');
      mockUserService.getUserById.mockRejectedValue(error);

      await userController.getUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    const newUserData = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    };

    beforeEach(() => {
      mockRequest.body = newUserData;
    });

    it('should create user and return 201 status', async () => {
      const createdUser = {
        id: 'new-id',
        ...newUserData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUserService.createUser.mockResolvedValue(createdUser);

      await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.createUser).toHaveBeenCalledWith(newUserData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ user: createdUser });
    });

    it('should call next with error when service fails', async () => {
      const error = new Error('Duplicate email');
      mockUserService.createUser.mockRejectedValue(error);

      await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.createUser).toHaveBeenCalledWith(newUserData);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    const userId = mockUser.id;
    const updateData = {
      name: 'Updated Name',
      isActive: false,
    };

    beforeEach(() => {
      mockRequest.params = { id: userId };
      mockRequest.body = updateData;
    });

    it('should update user and return 200 status when found', async () => {
      const updatedUser = { ...mockUser, ...updateData };
      mockUserService.updateUser.mockResolvedValue(updatedUser);

      await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(mockResponse.json).toHaveBeenCalledWith({ user: updatedUser });
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      mockUserService.updateUser.mockResolvedValue(null);

      await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should call next with error when service fails', async () => {
      const error = new Error('Database error');
      mockUserService.updateUser.mockRejectedValue(error);

      await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    const userId = mockUser.id;

    beforeEach(() => {
      mockRequest.params = { id: userId };
    });

    it('should delete user and return 204 status when found', async () => {
      mockUserService.deleteUser.mockResolvedValue(true);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      mockUserService.deleteUser.mockResolvedValue(false);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should call next with error when service fails', async () => {
      const error = new Error('Database error');
      mockUserService.deleteUser.mockRejectedValue(error);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(userId);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle non-Error objects', async () => {
      mockUserService.getAllUsers.mockRejectedValue('String error');

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith('String error');
    });
  });
});
