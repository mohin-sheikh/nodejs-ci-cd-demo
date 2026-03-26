import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
} from '../../../validators/user.validator';

describe('User Validators', () => {
  describe('createUserSchema', () => {
    const validUser = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should validate a valid user', () => {
      const { error } = createUserSchema.validate(validUser);
      expect(error).toBeUndefined();
    });

    it('should validate with optional isActive field', () => {
      const userWithIsActive = {
        ...validUser,
        isActive: false,
      };
      const { error } = createUserSchema.validate(userWithIsActive);
      expect(error).toBeUndefined();
    });

    describe('name validation', () => {
      it('should fail when name is missing', () => {
        const { error } = createUserSchema.validate({
          email: 'john@example.com',
          password: 'password123',
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('Name is required');
      });

      it('should fail when name is empty', () => {
        const { error } = createUserSchema.validate({
          ...validUser,
          name: '',
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('Name cannot be empty');
      });

      it('should fail when name is too short', () => {
        const { error } = createUserSchema.validate({
          ...validUser,
          name: 'J',
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('at least 2 characters');
      });

      it('should fail when name is too long', () => {
        const { error } = createUserSchema.validate({
          ...validUser,
          name: 'a'.repeat(101),
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('cannot exceed 100 characters');
      });
    });

    describe('email validation', () => {
      it('should fail when email is missing', () => {
        const { error } = createUserSchema.validate({
          name: 'John Doe',
          password: 'password123',
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('Email is required');
      });

      it('should fail when email is invalid', () => {
        const { error } = createUserSchema.validate({
          ...validUser,
          email: 'invalid-email',
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('valid email address');
      });

      it('should accept valid email formats', () => {
        const emails = [
          'user@example.com',
          'user.name@example.com',
          'user+tag@example.com',
          'user@subdomain.example.com',
        ];

        emails.forEach((email) => {
          const { error } = createUserSchema.validate({
            ...validUser,
            email,
          });
          expect(error).toBeUndefined();
        });
      });
    });

    describe('password validation', () => {
      it('should fail when password is missing', () => {
        const { error } = createUserSchema.validate({
          name: 'John Doe',
          email: 'john@example.com',
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('Password is required');
      });

      it('should fail when password is too short', () => {
        const { error } = createUserSchema.validate({
          ...validUser,
          password: '12345',
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('at least 6 characters');
      });

      it('should accept passwords with 6 or more characters', () => {
        const passwords = ['123456', 'abcdef', 'pass123', 'longerpassword'];

        passwords.forEach((password) => {
          const { error } = createUserSchema.validate({
            ...validUser,
            password,
          });
          expect(error).toBeUndefined();
        });
      });
    });
  });

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

    it('should validate partial update with password only', () => {
      const { error } = updateUserSchema.validate({
        password: 'newpassword123',
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
      it('should fail when password is too short', () => {
        const { error } = updateUserSchema.validate({
          password: '12345',
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('at least 6 characters');
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
        password: '123',
      };
      const { error } = createUserSchema.validate(invalidUser, {
        abortEarly: false,
      });
      expect(error).toBeDefined();
      expect(error?.details.length).toBeGreaterThanOrEqual(3);
    });
  });
});
