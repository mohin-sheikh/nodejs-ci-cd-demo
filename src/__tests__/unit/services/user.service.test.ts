import { UserService } from '../../../services/user.service';
import { UserRepository } from '../../../repositories/user.repository';
import { User } from '../../../entities/User';

jest.mock('../../../repositories/user.repository');

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed_password',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    (UserRepository as jest.Mock).mockImplementation(() => mockUserRepository);

    userService = new UserService();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: '2', email: 'jane@example.com' }];
      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users exist', async () => {
      mockUserRepository.findAll.mockResolvedValue([]);

      const result = await userService.getAllUsers();

      expect(result).toEqual([]);
      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(mockUserRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await userService.getUserById('non-existent-id');

      expect(result).toBeNull();
      expect(mockUserRepository.findById).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('createUser', () => {
    const newUserData = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    };

    it('should create a new user when email does not exist', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({ ...mockUser, ...newUserData });

      const result = await userService.createUser(newUserData);

      expect(result).toEqual({ ...mockUser, ...newUserData });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(newUserData.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith(newUserData);
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error when email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(userService.createUser(newUserData)).rejects.toThrow(
        'User with this email already exists'
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(newUserData.email);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    const updateData = {
      name: 'Updated Name',
      isActive: false,
    };

    it('should update user when found', async () => {
      const updatedUser = { ...mockUser, ...updateData };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(mockUser.id, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, updateData);
      expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.updateUser('non-existent-id', updateData)).rejects.toThrow(
        'User not found'
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
      const partialUpdate = { name: 'Updated Name Only' };
      const updatedUser = { ...mockUser, ...partialUpdate };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(mockUser.id, partialUpdate);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, partialUpdate);
    });
  });

  describe('deleteUser', () => {
    it('should delete user when found', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(true);

      const result = await userService.deleteUser(mockUser.id);

      expect(result).toBe(true);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(mockUser.id);
      expect(mockUserRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.deleteUser('non-existent-id')).rejects.toThrow('User not found');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      mockUserRepository.findAll.mockRejectedValue(dbError);

      await expect(userService.getAllUsers()).rejects.toThrow('Database connection failed');
    });

    it('should handle malformed user data', async () => {
      const invalidUserData = { name: '', email: 'invalid', password: '' };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockRejectedValue(new Error('Invalid user data'));

      await expect(userService.createUser(invalidUserData)).rejects.toThrow('Invalid user data');
    });
  });
});
