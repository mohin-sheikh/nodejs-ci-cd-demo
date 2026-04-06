import { UserService } from '../../../services/user.service';
import { UserRepository } from '../../../repositories/user.repository';
import { User } from '../../../entities/User';
import { PasswordService } from '../../../services/password.service';

jest.mock('../../../services/password.service');
jest.mock('../../../repositories/user.repository');

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPasswordService: jest.Mocked<typeof PasswordService>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Test@123456',
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
      findByEmailWithPassword: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    mockPasswordService = {
      hash: jest.fn(),
      verify: jest.fn(),
      validatePasswordStrength: jest.fn(),
      needsRehash: jest.fn(),
    } as unknown as jest.Mocked<typeof PasswordService>;

    (UserRepository as jest.Mock).mockImplementation(() => mockUserRepository);
    (PasswordService as unknown as jest.Mock) = jest
      .fn()
      .mockImplementation(() => mockPasswordService);

    PasswordService.validatePasswordStrength = mockPasswordService.validatePasswordStrength;
    PasswordService.hash = mockPasswordService.hash;
    PasswordService.verify = mockPasswordService.verify;
    PasswordService.needsRehash = mockPasswordService.needsRehash;

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
      password: 'Test@123456',
    };

    it('should create a new user when email does not exist', async () => {
      (PasswordService.validatePasswordStrength as jest.Mock).mockReturnValue({
        isValid: true,
      });

      (PasswordService.hash as jest.Mock).mockResolvedValue('hashed_password_argon2');

      mockUserRepository.findByEmail.mockResolvedValue(null);

      const createdUser = { ...mockUser, ...newUserData, password: 'hashed_password_argon2' };
      mockUserRepository.create.mockResolvedValue(createdUser);

      const result = await userService.createUser(newUserData);

      expect(result).toEqual(createdUser);
      expect(PasswordService.validatePasswordStrength).toHaveBeenCalledWith(newUserData.password);
      expect(PasswordService.hash).toHaveBeenCalledWith(newUserData.password);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(newUserData.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...newUserData,
        password: 'hashed_password_argon2',
      });
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error when password validation fails', async () => {
      const weakPasswordData = {
        ...newUserData,
        password: 'weak',
      };

      (PasswordService.validatePasswordStrength as jest.Mock).mockReturnValue({
        isValid: false,
        message: 'Password must be at least 8 characters long',
      });

      await expect(userService.createUser(weakPasswordData)).rejects.toThrow(
        'Password must be at least 8 characters long'
      );

      expect(PasswordService.validatePasswordStrength).toHaveBeenCalledWith(
        weakPasswordData.password
      );
      expect(PasswordService.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when email already exists', async () => {
      (PasswordService.validatePasswordStrength as jest.Mock).mockReturnValue({
        isValid: true,
      });

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(userService.createUser(newUserData)).rejects.toThrow(
        'User with this email already exists'
      );

      expect(PasswordService.validatePasswordStrength).toHaveBeenCalledWith(newUserData.password);
      expect(PasswordService.hash).not.toHaveBeenCalled();
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

    it('should update user with new password when provided', async () => {
      const updateWithPassword = {
        name: 'Updated Name',
        password: 'NewTest@123456',
      };

      const updatedUser = { ...mockUser, ...updateWithPassword, password: 'NewTest@123456' };

      (PasswordService.validatePasswordStrength as jest.Mock).mockReturnValue({
        isValid: true,
      });
      (PasswordService.hash as jest.Mock).mockResolvedValue('NewTest@123456');

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(mockUser.id, updateWithPassword);

      expect(result).toEqual(updatedUser);
      expect(PasswordService.validatePasswordStrength).toHaveBeenCalledWith(
        updateWithPassword.password
      );
      expect(PasswordService.hash).toHaveBeenCalledWith(updateWithPassword.password);
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, {
        ...updateWithPassword,
        password: 'NewTest@123456',
      });
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

  describe('validateUserCredentials', () => {
    it('should return user when credentials are valid', async () => {
      const userWithPassword = { ...mockUser, password: 'hashed_password' };
      mockUserRepository.findByEmailWithPassword?.mockResolvedValue(userWithPassword);
      (PasswordService.verify as jest.Mock).mockResolvedValue(true);
      (PasswordService.needsRehash as jest.Mock).mockResolvedValue(false);

      const result = await userService.validateUserCredentials(mockUser.email, 'Test@123456');

      expect(result).toBeDefined();
      expect(result?.password).toBeUndefined(); // Password should be excluded
      expect(mockUserRepository.findByEmailWithPassword).toHaveBeenCalledWith(mockUser.email);
      expect(PasswordService.verify).toHaveBeenCalledWith(userWithPassword.password, 'Test@123456');
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findByEmailWithPassword?.mockResolvedValue(null);

      const result = await userService.validateUserCredentials(
        'nonexistent@example.com',
        'password'
      );

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const userWithPassword = { ...mockUser, password: 'hashed_password' };
      mockUserRepository.findByEmailWithPassword?.mockResolvedValue(userWithPassword);
      (PasswordService.verify as jest.Mock).mockResolvedValue(false);

      const result = await userService.validateUserCredentials(mockUser.email, 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should rehash password when needed', async () => {
      const userWithPassword = { ...mockUser, password: 'old_hash' };
      mockUserRepository.findByEmailWithPassword?.mockResolvedValue(userWithPassword);
      (PasswordService.verify as jest.Mock).mockResolvedValue(true);
      (PasswordService.needsRehash as jest.Mock).mockResolvedValue(true);
      (PasswordService.hash as jest.Mock).mockResolvedValue('new_hash');
      mockUserRepository.update.mockResolvedValue({ ...userWithPassword, password: 'new_hash' });

      const result = await userService.validateUserCredentials(mockUser.email, 'Test@123456');

      expect(result).toBeDefined();
      expect(PasswordService.needsRehash).toHaveBeenCalledWith('old_hash');
      expect(PasswordService.hash).toHaveBeenCalledWith('Test@123456');
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, { password: 'new_hash' });
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

      (PasswordService.validatePasswordStrength as jest.Mock).mockReturnValue({
        isValid: false,
        message: 'Password is required',
      });

      await expect(userService.createUser(invalidUserData)).rejects.toThrow('Password is required');

      expect(PasswordService.validatePasswordStrength).toHaveBeenCalledWith('');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });
});
