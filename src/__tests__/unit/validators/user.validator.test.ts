import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
} from '../../../validators/user.validator';

describe('User Validators', () => {
  describe('updateUserSchema', () => {
    it('should validate partial update with name only', () => {
      const { error } = updateUserSchema.validate({
        name: 'Updated Name',
      });
      expect(error).toBeUndefined();
    });

    it('should validate partial update with email only', () => {
      const { error } = updateUserSchema.validate({
        email: 'updated@example.com',
      });
      expect(error).toBeUndefined();
    });

    it('should validate partial update with isActive only', () => {
      const { error } = updateUserSchema.validate({
        isActive: false,
      });
      expect(error).toBeUndefined();
    });

    it('should validate multiple fields update', () => {
      const { error } = updateUserSchema.validate({
        name: 'Updated Name',
        email: 'updated@example.com',
        isActive: true,
      });
      expect(error).toBeUndefined();
    });

    it('should validate empty object', () => {
      const { error } = updateUserSchema.validate({});
      expect(error).toBeUndefined();
    });

    describe('name validation', () => {
      it('should fail when name is too short', () => {
        const { error } = updateUserSchema.validate({
          name: 'J',
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('at least 2 characters');
      });

      it('should fail when name is too long', () => {
        const { error } = updateUserSchema.validate({
          name: 'a'.repeat(101),
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('cannot exceed 100 characters');
      });
    });

    describe('email validation', () => {
      it('should fail when email is invalid', () => {
        const { error } = updateUserSchema.validate({
          email: 'invalid-email',
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('valid email address');
      });
    });

    describe('password validation', () => {
      it('should fail when password is too short (less than 8 characters)', () => {
        const { error } = updateUserSchema.validate({
          password: 'Abc@123',
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('at least 8 characters');
      });

      it('should fail when password has no uppercase letter', () => {
        const { error } = updateUserSchema.validate({
          password: 'password###123',
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('uppercase letter');
      });

      it('should fail when password has no lowercase letter', () => {
        const { error } = updateUserSchema.validate({
          password: 'PASSWORD###123',
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('lowercase letter');
      });

      it('should fail when password has no number', () => {
        const { error } = updateUserSchema.validate({
          password: 'Password###',
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('number');
      });

      it('should fail when password has no special character', () => {
        const { error } = updateUserSchema.validate({
          password: 'Password123',
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('special character');
      });

      it('should accept valid passwords for update', () => {
        const { error } = updateUserSchema.validate({
          password: 'NewStrong@Pass123',
        });
        expect(error).toBeUndefined();
      });
    });
  });

  describe('userIdSchema', () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000';

    it('should validate a valid UUID', () => {
      const { error } = userIdSchema.validate({ id: validUUID });
      expect(error).toBeUndefined();
    });

    it('should fail when id is missing', () => {
      const { error } = userIdSchema.validate({});
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('User ID is required');
    });

    it('should fail when id is not a UUID', () => {
      const invalidIds = [
        'invalid-uuid',
        '123',
        '123e4567-e89b-12d3-a456',
        '123e4567-e89b-12d3-a456-426614174000-extra',
        'not-a-uuid',
      ];

      invalidIds.forEach((id) => {
        const { error } = userIdSchema.validate({ id });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('Invalid user ID format');
      });
    });

    it('should accept UUID v4 format', () => {
      const uuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        '987fcdeb-51a2-43d7-9abc-123456789012',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      ];

      uuids.forEach((uuid) => {
        const { error } = userIdSchema.validate({ id: uuid });
        expect(error).toBeUndefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple validation errors', () => {
      const invalidUser = {
        name: 'J',
        email: 'invalid',
        password: 'weak',
      };
      const { error } = createUserSchema.validate(invalidUser, {
        abortEarly: false,
      });
      expect(error).toBeDefined();
      expect(error?.details.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle password with exactly 8 characters meeting all requirements', () => {
      const { error } = createUserSchema.validate({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test@123',
      });
      expect(error).toBeUndefined();
    });

    it('should handle password with maximum length (128 chars)', () => {
      const longPassword = 'Test@123' + 'a'.repeat(120);
      const { error } = createUserSchema.validate({
        name: 'Test User',
        email: 'test@example.com',
        password: longPassword,
      });
      expect(error).toBeUndefined();
    });
  });
});
