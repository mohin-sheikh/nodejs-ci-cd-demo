import { PasswordService } from '../../../services/password.service';

describe('PasswordService', () => {
  const testPassword = 'Test@123456';
  let hashedPassword: string;

  describe('hash', () => {
    it('should hash a password successfully', async () => {
      const hash = await PasswordService.hash(testPassword);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(testPassword);
    });

    it('should generate different hashes for same password (due to salt)', async () => {
      const hash1 = await PasswordService.hash(testPassword);
      const hash2 = await PasswordService.hash(testPassword);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verify', () => {
    beforeAll(async () => {
      hashedPassword = await PasswordService.hash(testPassword);
    });

    it('should verify correct password', async () => {
      const isValid = await PasswordService.verify(hashedPassword, testPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const isValid = await PasswordService.verify(hashedPassword, 'WrongPassword123!');
      expect(isValid).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should accept strong password', () => {
      const result = PasswordService.validatePasswordStrength('StrongP@ssw0rd');
      expect(result.isValid).toBe(true);
    });

    it('should reject password shorter than 8 characters', () => {
      const result = PasswordService.validatePasswordStrength('Abc@123');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('at least 8 characters');
    });

    it('should reject password without uppercase', () => {
      const result = PasswordService.validatePasswordStrength('weak@pass123');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('uppercase');
    });

    it('should reject password without special character', () => {
      const result = PasswordService.validatePasswordStrength('WeakPass123');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('special character');
    });
  });
});
