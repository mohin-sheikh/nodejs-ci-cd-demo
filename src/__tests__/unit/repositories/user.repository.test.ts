import { UserRepository } from '../../../repositories/user.repository';
import { AppDataSource } from '../../../config/database';
import { User } from '../../../entities/User';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';

jest.mock('../../../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<User>>;

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

    mockTypeOrmRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockTypeOrmRepository);

    userRepository = new UserRepository();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: '2', email: 'jane@example.com' }];
      mockTypeOrmRepository.find.mockResolvedValue(mockUsers);

      const result = await userRepository.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockTypeOrmRepository.find).toHaveBeenCalledTimes(1);
      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith();
    });

    it('should return empty array when no users exist', async () => {
      mockTypeOrmRepository.find.mockResolvedValue([]);

      const result = await userRepository.findAll();

      expect(result).toEqual([]);
      expect(mockTypeOrmRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockTypeOrmRepository.find.mockRejectedValue(dbError);

      await expect(userRepository.findAll()).rejects.toThrow('Database connection failed');
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(mockUser);

      const result = await userRepository.findById(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null when user not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.findById('non-existent-id');

      expect(result).toBeNull();
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });

    it('should handle invalid UUID format gracefully', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.findById('invalid-uuid');

      expect(result).toBeNull();
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'invalid-uuid' },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return user when email exists', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(mockUser);

      const result = await userRepository.findByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null when email not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });

    it('should handle case sensitivity', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(mockUser);

      await userRepository.findByEmail(mockUser.email.toUpperCase());

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email.toUpperCase() },
      });
    });
  });

  describe('create', () => {
    const newUserData = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    };

    it('should create a new user successfully', async () => {
      const createdUser = { ...mockUser, ...newUserData };
      mockTypeOrmRepository.create.mockReturnValue(createdUser as User);
      mockTypeOrmRepository.save.mockResolvedValue(createdUser);

      const result = await userRepository.create(newUserData);

      expect(result).toEqual(createdUser);
      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(newUserData);
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(createdUser);
      expect(mockTypeOrmRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should include optional fields when provided', async () => {
      const userDataWithOptional = {
        ...newUserData,
        isActive: false,
      };
      const createdUser = { ...mockUser, ...userDataWithOptional };

      mockTypeOrmRepository.create.mockReturnValue(createdUser as User);
      mockTypeOrmRepository.save.mockResolvedValue(createdUser);

      const result = await userRepository.create(userDataWithOptional);

      expect(result).toEqual(createdUser);
      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(userDataWithOptional);
    });

    it('should handle database errors during creation', async () => {
      const dbError = new Error('Duplicate key violation');
      const createdUser = { ...mockUser, ...newUserData };
      mockTypeOrmRepository.create.mockReturnValue(createdUser as User);
      mockTypeOrmRepository.save.mockRejectedValue(dbError);

      await expect(userRepository.create(newUserData)).rejects.toThrow('Duplicate key violation');
    });
  });

  describe('update', () => {
    const updateData = {
      name: 'Updated Name',
      isActive: false,
    };

    it('should update user successfully', async () => {
      const updatedUser = { ...mockUser, ...updateData };
      const updateResult: UpdateResult = { affected: 1, raw: {}, generatedMaps: [] };
      mockTypeOrmRepository.update.mockResolvedValue(updateResult);
      mockTypeOrmRepository.findOne.mockResolvedValue(updatedUser);

      const result = await userRepository.update(mockUser.id, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith(mockUser.id, updateData);
      expect(mockTypeOrmRepository.update).toHaveBeenCalledTimes(1);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should return null when updating non-existent user', async () => {
      const updateResult: UpdateResult = { affected: 0, raw: {}, generatedMaps: [] };
      mockTypeOrmRepository.update.mockResolvedValue(updateResult);
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.update('non-existent-id', updateData);

      expect(result).toBeNull();
      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith('non-existent-id', updateData);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });

    it('should update only provided fields', async () => {
      const partialUpdate = { name: 'Updated Name Only' };
      const updatedUser = { ...mockUser, ...partialUpdate };
      const updateResult: UpdateResult = { affected: 1, raw: {}, generatedMaps: [] };

      mockTypeOrmRepository.update.mockResolvedValue(updateResult);
      mockTypeOrmRepository.findOne.mockResolvedValue(updatedUser);

      const result = await userRepository.update(mockUser.id, partialUpdate);

      expect(result).toEqual(updatedUser);
      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith(mockUser.id, partialUpdate);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      const deleteResult: DeleteResult = { affected: 1, raw: {} };
      mockTypeOrmRepository.delete.mockResolvedValue(deleteResult);

      const result = await userRepository.delete(mockUser.id);

      expect(result).toBe(true);
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith(mockUser.id);
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should return false when user not found', async () => {
      const deleteResult: DeleteResult = { affected: 0, raw: {} };
      mockTypeOrmRepository.delete.mockResolvedValue(deleteResult);

      const result = await userRepository.delete('non-existent-id');

      expect(result).toBe(false);
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith('non-existent-id');
    });

    it('should handle database errors during deletion', async () => {
      const dbError = new Error('Foreign key constraint violation');
      mockTypeOrmRepository.delete.mockRejectedValue(dbError);

      await expect(userRepository.delete(mockUser.id)).rejects.toThrow(
        'Foreign key constraint violation'
      );
    });
  });

  describe('Integration-like scenarios', () => {
    it('should handle create then find workflow', async () => {
      const newUserData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };
      const createdUser = { ...mockUser, ...newUserData };

      mockTypeOrmRepository.create.mockReturnValue(createdUser as User);
      mockTypeOrmRepository.save.mockResolvedValue(createdUser);
      mockTypeOrmRepository.findOne.mockResolvedValue(createdUser);

      const created = await userRepository.create(newUserData);
      const found = await userRepository.findById(created.id);

      expect(created).toEqual(createdUser);
      expect(found).toEqual(createdUser);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: created.id },
      });
    });

    it('should handle update then find workflow', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateData };
      const updateResult: UpdateResult = { affected: 1, raw: {}, generatedMaps: [] };

      mockTypeOrmRepository.update.mockResolvedValue(updateResult);
      mockTypeOrmRepository.findOne.mockResolvedValue(updatedUser);

      const result = await userRepository.update(mockUser.id, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });
  });
});
