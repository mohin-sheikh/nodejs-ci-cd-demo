import { loginSchema, refreshTokenSchema } from '../../../validators/auth.validator';

describe('Auth Validators', () => {
  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Test@123456',
      };
      const { error } = loginSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should fail when email is missing', () => {
      const invalidData = {
        password: 'Test@123456',
      };
      const { error } = loginSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('Email is required');
    });

    it('should fail when password is missing', () => {
      const invalidData = {
        email: 'test@example.com',
      };
      const { error } = loginSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('Password is required');
    });

    it('should fail when email is invalid format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Test@123456',
      };
      const { error } = loginSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('Please provide a valid email address');
    });

    it('should fail when both email and password are missing', () => {
      const { error } = loginSchema.validate({});
      expect(error).toBeDefined();
      expect(error?.details.length).toBeGreaterThanOrEqual(1);
      expect(error?.details[0].message).toContain('Email is required');
    });
  });

  describe('refreshTokenSchema', () => {
    it('should validate valid refresh token data', () => {
      const validData = {
        refreshToken: 'valid-refresh-token',
      };
      const { error } = refreshTokenSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should fail when refresh token is missing', () => {
      const { error } = refreshTokenSchema.validate({});
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('Refresh token is required');
    });

    it('should fail when refresh token is empty string', () => {
      const invalidData = {
        refreshToken: '',
      };
      const { error } = refreshTokenSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('is not allowed to be empty');
    });
  });
});
