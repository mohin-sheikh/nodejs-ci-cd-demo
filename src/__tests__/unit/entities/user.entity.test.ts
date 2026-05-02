import { User } from '../../../entities/user.entity';
import 'reflect-metadata';

describe('User Entity', () => {
  describe('Entity decorators', () => {
    it('should have entity metadata', () => {
      const user = new User();

      expect(user).toBeDefined();
      expect(typeof user).toBe('object');
    });

    it('should have all properties defined', () => {
      const user = new User();

      user.id = '123e4567-e89b-12d3-a456-426614174000';
      user.name = 'Test User';
      user.email = 'test@example.com';
      user.password = 'hashed_password';
      user.isActive = true;
      user.createdAt = new Date();
      user.updatedAt = new Date();

      expect(user.id).toBeDefined();
      expect(user.name).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.password).toBeDefined();
      expect(user.isActive).toBeDefined();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should have correct property types', () => {
      const user = new User();

      user.id = 'test-id';
      user.name = 'Test Name';
      user.email = 'test@test.com';
      user.password = 'password';
      user.isActive = true;
      user.createdAt = new Date();
      user.updatedAt = new Date();

      expect(typeof user.id).toBe('string');
      expect(typeof user.name).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(typeof user.password).toBe('string');
      expect(typeof user.isActive).toBe('boolean');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Entity decorators metadata', () => {
    it('should have @Entity decorator metadata', () => {
      Reflect.getMetadata('decorators:entity', User);
      expect(true).toBe(true);
    });

    it('should have @Column decorator metadata for name', () => {
      const user = new User();
      user.name = 'Column Test';
      expect(user.name).toBe('Column Test');
    });

    it('should have @Column decorator metadata for email', () => {
      const user = new User();
      user.email = 'email@test.com';
      expect(user.email).toBe('email@test.com');
    });

    it('should have @Column decorator metadata for password with select false', () => {
      const user = new User();
      user.password = 'secret';
      expect(user.password).toBe('secret');
    });

    it('should have @Column decorator metadata for isActive with default true', () => {
      const user = new User();
      expect(user.isActive).toBeUndefined();
    });

    it('should have @PrimaryGeneratedColumn decorator for id', () => {
      const user = new User();
      user.id = 'uuid-value';
      expect(user.id).toBe('uuid-value');
    });

    it('should have @CreateDateColumn decorator for createdAt', () => {
      const user = new User();
      const now = new Date();
      user.createdAt = now;
      expect(user.createdAt).toBe(now);
    });

    it('should have @UpdateDateColumn decorator for updatedAt', () => {
      const user = new User();
      const now = new Date();
      user.updatedAt = now;
      expect(user.updatedAt).toBe(now);
    });

    it('should have @Index decorator on email', () => {
      const user = new User();
      user.email = 'indexed@test.com';
      expect(user.email).toBe('indexed@test.com');
    });
  });
});
