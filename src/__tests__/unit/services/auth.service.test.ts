import { AuthService } from '../../../services/auth.service';
import { UserRepository } from '../../../repositories/user.repository';
import { PasswordService } from '../../../services/password.service';
import { JWTService } from '../../../services/jwt.service';

jest.mock('../../../repositories/user.repository');
jest.mock('../../../services/password.service');
jest.mock('../../../services/jwt.service');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPasswordService: jest.Mocked<typeof PasswordService>;
  let mockJWTService: jest.Mocked<typeof JWTService>;

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

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: '7d',
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
    tokens: mockTokens,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepository = {
      findByEmailWithPassword: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    mockPasswordService = {
      verify: jest.fn(),
      hash: jest.fn(),
      needsRehash: jest.fn(),
    } as unknown as jest.Mocked<typeof PasswordService>;

    mockJWTService = {
      generateTokens: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      decodeToken: jest.fn(),
    } as unknown as jest.Mocked<typeof JWTService>;

    (UserRepository as jest.Mock).mockImplementation(() => mockUserRepository);

    // Properly assign mock implementations without using 'any'
    Object.assign(PasswordService, {
      verify: mockPasswordService.verify,
      hash: mockPasswordService.hash,
      needsRehash: mockPasswordService.needsRehash,
    });

    Object.assign(JWTService, {
      generateTokens: mockJWTService.generateTokens,
      verifyRefreshToken: mockJWTService.verifyRefreshToken,
    });

    authService = new AuthService();
  });

  describe('login', () => {
    const email = 'john@example.com';
    const password = 'Test@123456';

    it('should return user with tokens when credentials are valid', async () => {
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockPasswordService.verify.mockResolvedValue(true);
      mockPasswordService.needsRehash.mockResolvedValue(false);
      mockJWTService.generateTokens.mockReturnValue(mockTokens);

      const result = await authService.login(email, password);

      expect(result).toEqual(expectedUserResponse);
      expect(mockUserRepository.findByEmailWithPassword).toHaveBeenCalledWith(email);
      expect(mockPasswordService.verify).toHaveBeenCalledWith(mockUser.password, password);
      expect(mockJWTService.generateTokens).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(null);

      const result = await authService.login(email, password);

      expect(result).toBeNull();
      expect(mockUserRepository.findByEmailWithPassword).toHaveBeenCalledWith(email);
      expect(mockPasswordService.verify).not.toHaveBeenCalled();
      expect(mockJWTService.generateTokens).not.toHaveBeenCalled();
    });

    it('should return null when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(inactiveUser);

      const result = await authService.login(email, password);

      expect(result).toBeNull();
      expect(mockUserRepository.findByEmailWithPassword).toHaveBeenCalledWith(email);
      expect(mockPasswordService.verify).not.toHaveBeenCalled();
      expect(mockJWTService.generateTokens).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockPasswordService.verify.mockResolvedValue(false);

      const result = await authService.login(email, password);

      expect(result).toBeNull();
      expect(mockUserRepository.findByEmailWithPassword).toHaveBeenCalledWith(email);
      expect(mockPasswordService.verify).toHaveBeenCalledWith(mockUser.password, password);
      expect(mockJWTService.generateTokens).not.toHaveBeenCalled();
    });

    it('should rehash password and generate tokens when needsRehash returns true', async () => {
      const newHash = 'new_hashed_password';
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockPasswordService.verify.mockResolvedValue(true);
      mockPasswordService.needsRehash.mockResolvedValue(true);
      mockPasswordService.hash.mockResolvedValue(newHash);
      mockUserRepository.update.mockResolvedValue({ ...mockUser, password: newHash });
      mockJWTService.generateTokens.mockReturnValue(mockTokens);

      const result = await authService.login(email, password);

      expect(result).toEqual(expectedUserResponse);
      expect(mockPasswordService.needsRehash).toHaveBeenCalledWith(mockUser.password);
      expect(mockPasswordService.hash).toHaveBeenCalledWith(password);
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, { password: newHash });
      expect(mockJWTService.generateTokens).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      mockUserRepository.findByEmailWithPassword.mockRejectedValue(dbError);

      await expect(authService.login(email, password)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('refreshToken', () => {
    const refreshToken = 'valid-refresh-token';
    const mockDecodedUser = {
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
    };
    const mockNewTokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expiresIn: '7d',
    };

    it('should return new tokens when refresh token is valid', async () => {
      mockJWTService.verifyRefreshToken.mockReturnValue(mockDecodedUser);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockJWTService.generateTokens.mockReturnValue(mockNewTokens);

      const result = await authService.refreshToken(refreshToken);

      expect(result).toEqual(mockNewTokens);
      expect(mockJWTService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(mockJWTService.generateTokens).toHaveBeenCalledWith(mockDecodedUser);
    });

    it('should return null when refresh token is invalid', async () => {
      mockJWTService.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Invalid refresh token');
      });

      const result = await authService.refreshToken(refreshToken);

      expect(result).toBeNull();
      expect(mockJWTService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockJWTService.generateTokens).not.toHaveBeenCalled();
    });

    it('should return null when user not found', async () => {
      mockJWTService.verifyRefreshToken.mockReturnValue(mockDecodedUser);
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await authService.refreshToken(refreshToken);

      expect(result).toBeNull();
      expect(mockJWTService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(mockJWTService.generateTokens).not.toHaveBeenCalled();
    });

    it('should return null when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockJWTService.verifyRefreshToken.mockReturnValue(mockDecodedUser);
      mockUserRepository.findById.mockResolvedValue(inactiveUser);

      const result = await authService.refreshToken(refreshToken);

      expect(result).toBeNull();
      expect(mockJWTService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(mockJWTService.generateTokens).not.toHaveBeenCalled();
    });
  });
});
