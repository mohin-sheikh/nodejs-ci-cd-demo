import { PasswordService } from '../../../services/password.service';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('PasswordService', () => {
  const testPassword = 'Test@123456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hash', () => {
    it('should hash a password successfully', async () => {
      const mockHash = 'argon2id$v=19$m=65536,t=3,p=1$hashvalue';
      (argon2.hash as jest.Mock).mockResolvedValue(mockHash);

      const hash = await PasswordService.hash(testPassword);

      expect(hash).toBe(mockHash);
      expect(argon2.hash).toHaveBeenCalledWith(
        testPassword,
        expect.objectContaining({
          type: argon2.argon2id,
          memoryCost: 65536,
          timeCost: 3,
          parallelism: 1,
        })
      );
    });

    it('should generate different hashes for same password (due to salt)', async () => {
      const mockHash1 = 'argon2id$v=19$m=65536,t=3,p=1$hashvalue1';
      const mockHash2 = 'argon2id$v=19$m=65536,t=3,p=1$hashvalue2';
      (argon2.hash as jest.Mock).mockResolvedValueOnce(mockHash1);
      (argon2.hash as jest.Mock).mockResolvedValueOnce(mockHash2);

      const hash1 = await PasswordService.hash(testPassword);
      const hash2 = await PasswordService.hash(testPassword);

      expect(hash1).not.toBe(hash2);
      expect(argon2.hash).toHaveBeenCalledTimes(2);
    });

    it('should throw error when hashing fails', async () => {
      (argon2.hash as jest.Mock).mockRejectedValue(new Error('Hashing failed'));

      await expect(PasswordService.hash(testPassword)).rejects.toThrow(
        'Failed to hash password: Hashing failed'
      );
    });

    it('should handle unknown error when hashing fails', async () => {
      (argon2.hash as jest.Mock).mockRejectedValue('Unknown error string');

      await expect(PasswordService.hash(testPassword)).rejects.toThrow(
        'Failed to hash password: Unknown error'
      );
    });
  });

  describe('verify', () => {
    const mockHash = 'argon2id$v=19$m=65536,t=3,p=1$hashvalue';

    it('should verify correct password', async () => {
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const isValid = await PasswordService.verify(mockHash, testPassword);

      expect(isValid).toBe(true);
      expect(argon2.verify).toHaveBeenCalledWith(mockHash, testPassword);
    });

    it('should reject incorrect password', async () => {
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      const isValid = await PasswordService.verify(mockHash, 'WrongPassword123!');

      expect(isValid).toBe(false);
      expect(argon2.verify).toHaveBeenCalledWith(mockHash, 'WrongPassword123!');
    });

    it('should throw error when verification fails', async () => {
      (argon2.verify as jest.Mock).mockRejectedValue(new Error('Verification failed'));

      await expect(PasswordService.verify(mockHash, testPassword)).rejects.toThrow(
        'Failed to verify password: Verification failed'
      );
    });

    it('should handle unknown error when verification fails', async () => {
      (argon2.verify as jest.Mock).mockRejectedValue('Unknown error string');

      await expect(PasswordService.verify(mockHash, testPassword)).rejects.toThrow(
        'Failed to verify password: Unknown error'
      );
    });
  });

  describe('needsRehash', () => {
    const mockHash = 'argon2id$v=19$m=65536,t=3,p=1$hashvalue';

    it('should return true when rehash is needed', async () => {
      (argon2.needsRehash as jest.Mock).mockResolvedValue(true);

      const result = await PasswordService.needsRehash(mockHash);

      expect(result).toBe(true);
      expect(argon2.needsRehash).toHaveBeenCalledWith(
        mockHash,
        expect.objectContaining({
          type: argon2.argon2id,
          memoryCost: 65536,
          timeCost: 3,
          parallelism: 1,
        })
      );
    });

    it('should return false when rehash is not needed', async () => {
      (argon2.needsRehash as jest.Mock).mockResolvedValue(false);

      const result = await PasswordService.needsRehash(mockHash);

      expect(result).toBe(false);
    });

    it('should return true when needsRehash throws error', async () => {
      (argon2.needsRehash as jest.Mock).mockRejectedValue(new Error('Check failed'));

      const result = await PasswordService.needsRehash(mockHash);

      expect(result).toBe(true);
    });

    it('should accept custom options', async () => {
      (argon2.needsRehash as jest.Mock).mockResolvedValue(true);
      const customOptions = { memoryCost: 32768, timeCost: 2 };

      await PasswordService.needsRehash(mockHash, customOptions);

      expect(argon2.needsRehash).toHaveBeenCalledWith(
        mockHash,
        expect.objectContaining({
          memoryCost: 32768,
          timeCost: 2,
        })
      );
    });
  });

  describe('validatePasswordStrength', () => {
    it('should accept strong password', () => {
      const result = PasswordService.validatePasswordStrength('StrongP@ssw0rd');
      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should reject password shorter than 8 characters', () => {
      const result = PasswordService.validatePasswordStrength('Abc@123');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('at least 8 characters');
    });

    it('should reject password longer than 128 characters', () => {
      const longPassword = 'A'.repeat(129) + '@1a';
      const result = PasswordService.validatePasswordStrength(longPassword);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('cannot exceed 128 characters');
    });

    it('should reject empty password', () => {
      const result = PasswordService.validatePasswordStrength('');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password is required');
    });

    it('should reject null/undefined password', () => {
      const result = PasswordService.validatePasswordStrength(undefined as unknown as string);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password is required');
    });

    it('should reject password without uppercase', () => {
      const result = PasswordService.validatePasswordStrength('weak@pass123');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('uppercase letter');
    });

    it('should reject password without lowercase', () => {
      const result = PasswordService.validatePasswordStrength('WEAK@PASS123');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('lowercase letter');
    });

    it('should reject password without number', () => {
      const result = PasswordService.validatePasswordStrength('Weak@Pass');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('number');
    });

    it('should reject password without special character', () => {
      const result = PasswordService.validatePasswordStrength('WeakPass123');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('special character');
    });

    it('should accept password with exactly 8 characters meeting all requirements', () => {
      const result = PasswordService.validatePasswordStrength('Test@123');
      expect(result.isValid).toBe(true);
    });

    it('should accept password with exactly 128 characters', () => {
      let password = 'Test@123';
      while (password.length < 128) {
        password += 'a';
      }
      const result = PasswordService.validatePasswordStrength(password);
      expect(result.isValid).toBe(true);
    });
  });
});
