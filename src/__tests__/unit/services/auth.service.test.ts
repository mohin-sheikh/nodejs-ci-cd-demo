import { AuthService } from '../../../services/auth.service';
import { UserRepository } from '../../../repositories/user.repository';
import { PasswordService } from '../../../services/password.service';
import { JWTService } from '../../../services/jwt.service';

jest.mock('../../../repositories/user.repository');
jest.mock('../../../services/password.service');
jest.mock('../../../services/jwt.service');
jest.mock('../../../services/redis.service', () => ({
  __esModule: true,
  default: {
    set: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(undefined),
    exists: jest.fn().mockResolvedValue(false),
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(undefined),
    ttl: jest.fn().mockResolvedValue(60),
    hset: jest.fn().mockResolvedValue(undefined),
    hget: jest.fn().mockResolvedValue(null),
    hdel: jest.fn().mockResolvedValue(undefined),
    hgetall: jest.fn().mockResolvedValue({}),
    sadd: jest.fn().mockResolvedValue(undefined),
    srem: jest.fn().mockResolvedValue(undefined),
    smembers: jest.fn().mockResolvedValue([]),
    sismember: jest.fn().mockResolvedValue(false),
  },
}));

import RedisService from '../../../services/redis.service';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPasswordService: jest.Mocked<typeof PasswordService>;
  let mockJWTService: jest.Mocked<typeof JWTService>;
  let mockRedisService: jest.Mocked<typeof RedisService>;

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

    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    mockRedisService = RedisService as jest.Mocked<typeof RedisService>;

    mockPasswordService = {
      verify: jest.fn(),
      hash: jest.fn(),
      needsRehash: jest.fn(),
      validatePasswordStrength: jest.fn(),
    } as unknown as jest.Mocked<typeof PasswordService>;

    mockJWTService = {
      generateTokens: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      decodeToken: jest.fn(),
    } as unknown as jest.Mocked<typeof JWTService>;

    mockUserRepository.findByEmailWithPassword = jest.fn();
    mockUserRepository.update = jest.fn();
    mockUserRepository.findById = jest.fn();
    mockUserRepository.findAll = jest.fn();
    mockUserRepository.findByEmail = jest.fn();
    mockUserRepository.create = jest.fn();
    mockUserRepository.delete = jest.fn();

    (UserRepository as jest.Mock).mockImplementation(() => mockUserRepository);

    Object.assign(PasswordService, {
      verify: mockPasswordService.verify,
      hash: mockPasswordService.hash,
      needsRehash: mockPasswordService.needsRehash,
      validatePasswordStrength: mockPasswordService.validatePasswordStrength,
    });

    Object.assign(JWTService, {
      generateTokens: mockJWTService.generateTokens,
      verifyAccessToken: mockJWTService.verifyAccessToken,
      verifyRefreshToken: mockJWTService.verifyRefreshToken,
      decodeToken: mockJWTService.decodeToken,
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
      mockRedisService.hset.mockResolvedValue(undefined);
      mockRedisService.set.mockResolvedValue(undefined);

      const result = await authService.login(email, password);

      expect(result).toEqual(expectedUserResponse);
      expect(mockUserRepository.findByEmailWithPassword).toHaveBeenCalledWith(email);
      expect(mockPasswordService.verify).toHaveBeenCalledWith(mockUser.password, password);
      expect(mockJWTService.generateTokens).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
        expect.any(String)
      );
      expect(mockRedisService.hset).toHaveBeenCalled();
      expect(mockRedisService.set).toHaveBeenCalled();
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
      mockRedisService.hset.mockResolvedValue(undefined);
      mockRedisService.set.mockResolvedValue(undefined);

      const result = await authService.login(email, password);

      expect(result).toEqual(expectedUserResponse);
      expect(mockPasswordService.needsRehash).toHaveBeenCalledWith(mockUser.password);
      expect(mockPasswordService.hash).toHaveBeenCalledWith(password);
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, { password: newHash });
      expect(mockJWTService.generateTokens).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
        expect.any(String)
      );
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
      jti: 'mock-token-id',
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
      mockRedisService.exists.mockResolvedValue(false);
      mockRedisService.hset.mockResolvedValue(undefined);
      mockRedisService.hdel.mockResolvedValue(undefined);
      mockRedisService.set.mockResolvedValue(undefined);

      const result = await authService.refreshToken(refreshToken);

      expect(result).toEqual(mockNewTokens);
      expect(mockJWTService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockRedisService.exists).toHaveBeenCalledWith(
        `blacklist:token:${mockDecodedUser.jti}`
      );
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(mockJWTService.generateTokens).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
        expect.any(String)
      );
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

    it('should return null when token is blacklisted', async () => {
      mockJWTService.verifyRefreshToken.mockReturnValue(mockDecodedUser);
      mockRedisService.exists.mockResolvedValue(true);

      const result = await authService.refreshToken(refreshToken);

      expect(result).toBeNull();
      expect(mockJWTService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockRedisService.exists).toHaveBeenCalledWith(
        `blacklist:token:${mockDecodedUser.jti}`
      );
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockJWTService.generateTokens).not.toHaveBeenCalled();
    });

    it('should return null when user not found', async () => {
      mockJWTService.verifyRefreshToken.mockReturnValue(mockDecodedUser);
      mockRedisService.exists.mockResolvedValue(false);
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
      mockRedisService.exists.mockResolvedValue(false);
      mockUserRepository.findById.mockResolvedValue(inactiveUser);

      const result = await authService.refreshToken(refreshToken);

      expect(result).toBeNull();
      expect(mockJWTService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(mockJWTService.generateTokens).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    const userId = mockUser.id;
    const refreshToken = 'valid-refresh-token';
    const mockDecodedUser = {
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      jti: 'mock-token-id',
    };

    it('should blacklist token and remove session on logout', async () => {
      mockJWTService.decodeToken.mockReturnValue(mockDecodedUser);
      mockRedisService.set.mockResolvedValue(undefined);
      mockRedisService.hdel.mockResolvedValue(undefined);
      mockRedisService.del.mockResolvedValue(undefined);

      await authService.logout(userId, refreshToken);

      expect(mockJWTService.decodeToken).toHaveBeenCalledWith(refreshToken);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `blacklist:token:${mockDecodedUser.jti}`,
        'revoked',
        2592000
      );
      expect(mockRedisService.hdel).toHaveBeenCalledWith(
        `user:${userId}:tokens`,
        mockDecodedUser.jti
      );
      expect(mockRedisService.del).toHaveBeenCalledWith(`user:${userId}:profile`);
    });

    it('should handle logout when token cannot be decoded', async () => {
      mockJWTService.decodeToken.mockReturnValue(null);
      mockRedisService.del.mockResolvedValue(undefined);

      await authService.logout(userId, refreshToken);

      expect(mockJWTService.decodeToken).toHaveBeenCalledWith(refreshToken);
      expect(mockRedisService.set).not.toHaveBeenCalled();
      expect(mockRedisService.hdel).not.toHaveBeenCalled();
      expect(mockRedisService.del).toHaveBeenCalledWith(`user:${userId}:profile`);
    });
  });

  describe('logoutAllDevices', () => {
    const userId = mockUser.id;
    const mockSessions = {
      'token-id-1': { tokenId: 'token-id-1', createdAt: '2024-01-01' },
      'token-id-2': { tokenId: 'token-id-2', createdAt: '2024-01-02' },
    };

    it('should blacklist all tokens and clear all sessions', async () => {
      mockRedisService.hgetall.mockResolvedValue(mockSessions);
      mockRedisService.set.mockResolvedValue(undefined);
      mockRedisService.del.mockResolvedValue(undefined);

      await authService.logoutAllDevices(userId);

      expect(mockRedisService.hgetall).toHaveBeenCalledWith(`user:${userId}:tokens`);
      expect(mockRedisService.set).toHaveBeenCalledTimes(2);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'blacklist:token:token-id-1',
        'revoked',
        2592000
      );
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'blacklist:token:token-id-2',
        'revoked',
        2592000
      );
      expect(mockRedisService.del).toHaveBeenCalledWith(`user:${userId}:tokens`);
      expect(mockRedisService.del).toHaveBeenCalledWith(`user:${userId}:profile`);
    });

    it('should handle logout all when no sessions exist', async () => {
      mockRedisService.hgetall.mockResolvedValue({});
      mockRedisService.del.mockResolvedValue(undefined);

      await authService.logoutAllDevices(userId);

      expect(mockRedisService.hgetall).toHaveBeenCalledWith(`user:${userId}:tokens`);
      expect(mockRedisService.set).not.toHaveBeenCalled();
      expect(mockRedisService.del).toHaveBeenCalledWith(`user:${userId}:tokens`);
      expect(mockRedisService.del).toHaveBeenCalledWith(`user:${userId}:profile`);
    });
  });

  describe('getActiveSessions', () => {
    const userId = mockUser.id;
    const mockSessions = {
      'token-id-1': { tokenId: 'token-id-1', createdAt: '2024-01-01' },
      'token-id-2': { tokenId: 'token-id-2', createdAt: '2024-01-02' },
    };

    it('should return all active sessions', async () => {
      mockRedisService.hgetall.mockResolvedValue(mockSessions);

      const result = await authService.getActiveSessions(userId);

      expect(result).toEqual(Object.values(mockSessions));
      expect(mockRedisService.hgetall).toHaveBeenCalledWith(`user:${userId}:tokens`);
    });

    it('should return empty array when no sessions exist', async () => {
      mockRedisService.hgetall.mockResolvedValue({});

      const result = await authService.getActiveSessions(userId);

      expect(result).toEqual([]);
      expect(mockRedisService.hgetall).toHaveBeenCalledWith(`user:${userId}:tokens`);
    });
  });
});
