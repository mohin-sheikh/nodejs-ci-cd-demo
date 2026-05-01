import { AuthService } from '../../../services/auth.service';
import { UserRepository } from '../../../repositories/user.repository';
import { PasswordService } from '../../../services/password.service';

jest.mock('../../../repositories/user.repository');
jest.mock('../../../services/password.service');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPasswordService: jest.Mocked<typeof PasswordService>;

  const mockDate = new Date();
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed_password',
    isActive: true,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const expectedUserResponse = {
    user: {
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      isActive: mockUser.isActive,
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepository = {
      findByEmailWithPassword: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    mockPasswordService = {
      verify: jest.fn(),
      hash: jest.fn(),
      needsRehash: jest.fn(),
    } as unknown as jest.Mocked<typeof PasswordService>;

    (UserRepository as jest.Mock).mockImplementation(() => mockUserRepository);
    (PasswordService.verify as jest.Mock) = mockPasswordService.verify;
    (PasswordService.hash as jest.Mock) = mockPasswordService.hash;
    (PasswordService.needsRehash as jest.Mock) = mockPasswordService.needsRehash;

    authService = new AuthService();
  });

  describe('login', () => {
    const email = 'john@example.com';
    const password = 'Test@123456';

    it('should return user when credentials are valid', async () => {
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockPasswordService.verify.mockResolvedValue(true);
      mockPasswordService.needsRehash.mockResolvedValue(false);

      const result = await authService.login(email, password);

      expect(result).toEqual(expectedUserResponse);
      expect(mockUserRepository.findByEmailWithPassword).toHaveBeenCalledWith(email);
      expect(mockPasswordService.verify).toHaveBeenCalledWith(mockUser.password, password);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(null);

      const result = await authService.login(email, password);

      expect(result).toBeNull();
      expect(mockUserRepository.findByEmailWithPassword).toHaveBeenCalledWith(email);
      expect(mockPasswordService.verify).not.toHaveBeenCalled();
    });

    it('should return null when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(inactiveUser);

      const result = await authService.login(email, password);

      expect(result).toBeNull();
      expect(mockUserRepository.findByEmailWithPassword).toHaveBeenCalledWith(email);
      expect(mockPasswordService.verify).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockPasswordService.verify.mockResolvedValue(false);

      const result = await authService.login(email, password);

      expect(result).toBeNull();
      expect(mockUserRepository.findByEmailWithPassword).toHaveBeenCalledWith(email);
      expect(mockPasswordService.verify).toHaveBeenCalledWith(mockUser.password, password);
    });

    it('should rehash password when needsRehash returns true', async () => {
      const newHash = 'new_hashed_password';
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockPasswordService.verify.mockResolvedValue(true);
      mockPasswordService.needsRehash.mockResolvedValue(true);
      mockPasswordService.hash.mockResolvedValue(newHash);
      mockUserRepository.update.mockResolvedValue({ ...mockUser, password: newHash });

      const result = await authService.login(email, password);

      expect(result).toEqual(expectedUserResponse);
      expect(mockPasswordService.needsRehash).toHaveBeenCalledWith(mockUser.password);
      expect(mockPasswordService.hash).toHaveBeenCalledWith(password);
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, { password: newHash });
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      mockUserRepository.findByEmailWithPassword.mockRejectedValue(dbError);

      await expect(authService.login(email, password)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
