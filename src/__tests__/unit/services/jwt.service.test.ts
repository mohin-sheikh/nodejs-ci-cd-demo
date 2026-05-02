// Mock jsonwebtoken before importing anything
const mockSign = jest.fn();
const mockVerify = jest.fn();
const mockDecode = jest.fn();

// Create actual error classes for instanceof checks
class MockTokenExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

class MockJsonWebTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JsonWebTokenError';
  }
}

jest.mock('jsonwebtoken', () => ({
  sign: (...args: unknown[]) => mockSign(...args),
  verify: (...args: unknown[]) => mockVerify(...args),
  decode: (...args: unknown[]) => mockDecode(...args),
  TokenExpiredError: MockTokenExpiredError,
  JsonWebTokenError: MockJsonWebTokenError,
}));

// Store the original env
const originalEnv = { ...process.env };

// Define the JWTService type
interface JWTServiceType {
  generateTokens: (payload: { id: string; email: string; name: string }) => {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
  verifyAccessToken: (token: string) => { id: string; email: string; name: string };
  verifyRefreshToken: (token: string) => { id: string; email: string; name: string };
  decodeToken: (token: string) => { id: string; email: string; name: string } | null;
}

describe('JWTService', () => {
  const mockPayload = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockAccessToken = 'mock-access-token';
  const mockRefreshToken = 'mock-refresh-token';

  let JWTService: JWTServiceType;

  beforeAll(async () => {
    // Set test environment variables
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_EXPIRES_IN = '7d';
    process.env.JWT_REFRESH_EXPIRES_IN = '30d';

    // Import the module after setting env vars
    const module = await import('../../../services/jwt.service');
    JWTService = module.JWTService as JWTServiceType;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore original env
    process.env = { ...originalEnv };
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      mockSign.mockReturnValueOnce(mockAccessToken);
      mockSign.mockReturnValueOnce(mockRefreshToken);

      const result = JWTService.generateTokens(mockPayload);

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        expiresIn: '7d',
      });

      expect(mockSign).toHaveBeenCalledTimes(2);
      expect(mockSign).toHaveBeenNthCalledWith(1, mockPayload, 'test-secret', {
        expiresIn: '7d',
      });
      expect(mockSign).toHaveBeenNthCalledWith(2, mockPayload, 'test-refresh-secret', {
        expiresIn: '30d',
      });
    });

    it('should use default secrets when env variables are not set', async () => {
      // Create a fresh module with different env vars
      delete process.env.JWT_SECRET;
      delete process.env.JWT_REFRESH_SECRET;

      // Reset modules and re-import
      jest.resetModules();

      const module = await import('../../../services/jwt.service');
      const FreshJWTService = module.JWTService as JWTServiceType;

      mockSign.mockClear();
      mockSign.mockReturnValueOnce(mockAccessToken);
      mockSign.mockReturnValueOnce(mockRefreshToken);

      const result = FreshJWTService.generateTokens(mockPayload);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe(mockAccessToken);
      expect(result.refreshToken).toBe(mockRefreshToken);
      expect(result.expiresIn).toBe('7d');

      expect(mockSign).toHaveBeenCalledWith(mockPayload, 'default-secret-key', {
        expiresIn: '7d',
      });
      expect(mockSign).toHaveBeenCalledWith(mockPayload, 'default-refresh-key', {
        expiresIn: '30d',
      });

      // Restore env vars for other tests
      process.env.JWT_SECRET = 'test-secret';
      process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    });

    it('should use default expiresIn when env variables are not set for expiration', async () => {
      // Save original values
      const originalExpiresIn = process.env.JWT_EXPIRES_IN;
      const originalRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN;

      // Delete expiration env vars
      delete process.env.JWT_EXPIRES_IN;
      delete process.env.JWT_REFRESH_EXPIRES_IN;

      // Reset modules and re-import
      jest.resetModules();

      const module = await import('../../../services/jwt.service');
      const FreshJWTService = module.JWTService as JWTServiceType;

      mockSign.mockClear();
      mockSign.mockReturnValueOnce(mockAccessToken);
      mockSign.mockReturnValueOnce(mockRefreshToken);

      const result = FreshJWTService.generateTokens(mockPayload);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe(mockAccessToken);
      expect(result.refreshToken).toBe(mockRefreshToken);
      // Default expiresIn should be '7d'
      expect(result.expiresIn).toBe('7d');

      expect(mockSign).toHaveBeenCalledWith(mockPayload, 'test-secret', {
        expiresIn: '7d',
      });
      expect(mockSign).toHaveBeenCalledWith(mockPayload, 'test-refresh-secret', {
        expiresIn: '30d',
      });

      // Restore env vars
      if (originalExpiresIn) process.env.JWT_EXPIRES_IN = originalExpiresIn;
      if (originalRefreshExpiresIn) process.env.JWT_REFRESH_EXPIRES_IN = originalRefreshExpiresIn;
    });

    it('should handle numeric expiresIn values', async () => {
      // Save original values
      const originalExpiresIn = process.env.JWT_EXPIRES_IN;
      const originalRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN;

      // Set numeric expiration values
      process.env.JWT_EXPIRES_IN = '3600'; // 1 hour in seconds
      process.env.JWT_REFRESH_EXPIRES_IN = '604800'; // 7 days in seconds

      // Reset modules and re-import
      jest.resetModules();

      const module = await import('../../../services/jwt.service');
      const FreshJWTService = module.JWTService as JWTServiceType;

      mockSign.mockClear();
      mockSign.mockReturnValueOnce(mockAccessToken);
      mockSign.mockReturnValueOnce(mockRefreshToken);

      const result = FreshJWTService.generateTokens(mockPayload);

      expect(result).toBeDefined();
      expect(result.expiresIn).toBe('3600');

      expect(mockSign).toHaveBeenCalledWith(mockPayload, 'test-secret', {
        expiresIn: '3600',
      });
      expect(mockSign).toHaveBeenCalledWith(mockPayload, 'test-refresh-secret', {
        expiresIn: '604800',
      });

      // Restore env vars
      if (originalExpiresIn) process.env.JWT_EXPIRES_IN = originalExpiresIn;
      if (originalRefreshExpiresIn) process.env.JWT_REFRESH_EXPIRES_IN = originalRefreshExpiresIn;
    });
  });

  describe('verifyAccessToken', () => {
    it('should return decoded payload for valid token', () => {
      mockVerify.mockReturnValue(mockPayload);

      const result = JWTService.verifyAccessToken('valid-token');

      expect(result).toEqual(mockPayload);
      expect(mockVerify).toHaveBeenCalledWith('valid-token', 'test-secret');
    });

    it('should throw error for expired token', () => {
      const expiredError = new MockTokenExpiredError('jwt expired');
      mockVerify.mockImplementation(() => {
        throw expiredError;
      });

      expect(() => JWTService.verifyAccessToken('expired-token')).toThrow('Token expired');
      expect(mockVerify).toHaveBeenCalledWith('expired-token', 'test-secret');
    });

    it('should throw error for invalid token', () => {
      const invalidError = new MockJsonWebTokenError('invalid token');
      mockVerify.mockImplementation(() => {
        throw invalidError;
      });

      expect(() => JWTService.verifyAccessToken('invalid-token')).toThrow('Invalid token');
      expect(mockVerify).toHaveBeenCalledWith('invalid-token', 'test-secret');
    });

    it('should throw generic error for unknown verification errors', () => {
      mockVerify.mockImplementation(() => {
        throw new Error('Unknown error');
      });

      expect(() => JWTService.verifyAccessToken('some-token')).toThrow('Authentication failed');
      expect(mockVerify).toHaveBeenCalledWith('some-token', 'test-secret');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return decoded payload for valid refresh token', () => {
      mockVerify.mockReturnValue(mockPayload);

      const result = JWTService.verifyRefreshToken('valid-refresh-token');

      expect(result).toEqual(mockPayload);
      expect(mockVerify).toHaveBeenCalledWith('valid-refresh-token', 'test-refresh-secret');
    });

    it('should throw error for expired refresh token', () => {
      const expiredError = new MockTokenExpiredError('jwt expired');
      mockVerify.mockImplementation(() => {
        throw expiredError;
      });

      expect(() => JWTService.verifyRefreshToken('expired-refresh-token')).toThrow(
        'Refresh token expired'
      );
      expect(mockVerify).toHaveBeenCalledWith('expired-refresh-token', 'test-refresh-secret');
    });

    it('should throw error for invalid refresh token', () => {
      const invalidError = new MockJsonWebTokenError('invalid token');
      mockVerify.mockImplementation(() => {
        throw invalidError;
      });

      expect(() => JWTService.verifyRefreshToken('invalid-refresh-token')).toThrow(
        'Invalid refresh token'
      );
      expect(mockVerify).toHaveBeenCalledWith('invalid-refresh-token', 'test-refresh-secret');
    });
  });

  describe('decodeToken', () => {
    it('should decode token without verification', () => {
      mockDecode.mockReturnValue(mockPayload);

      const result = JWTService.decodeToken('some-token');

      expect(result).toEqual(mockPayload);
      expect(mockDecode).toHaveBeenCalledWith('some-token');
    });

    it('should return null when decoding fails', () => {
      mockDecode.mockImplementation(() => {
        throw new Error('Decode failed');
      });

      const result = JWTService.decodeToken('invalid-token');

      expect(result).toBeNull();
      expect(mockDecode).toHaveBeenCalledWith('invalid-token');
    });

    it('should return null for malformed token', () => {
      mockDecode.mockReturnValue(null);

      const result = JWTService.decodeToken('malformed-token');

      expect(result).toBeNull();
      expect(mockDecode).toHaveBeenCalledWith('malformed-token');
    });
  });
});
