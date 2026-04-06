import * as argon2 from 'argon2';

export interface Argon2Options {
  type?: argon2.Options['type'];
  memoryCost?: number;
  timeCost?: number;
  parallelism?: number;
}

export class PasswordService {
  private static readonly DEFAULT_OPTIONS: Argon2Options = {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  };

  /**
   * Hash a plain text password
   * @param password - Plain text password
   * @param options - Optional Argon2 parameters
   * @returns Hashed password string (includes all parameters)
   */
  static async hash(password: string, options: Argon2Options = {}): Promise<string> {
    const finalOptions = { ...this.DEFAULT_OPTIONS, ...options };

    try {
      const hash = await argon2.hash(password, finalOptions);
      return hash;
    } catch (error) {
      throw new Error(
        `Failed to hash password: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Verify a password against a hash
   * @param hash - Stored password hash
   * @param password - Plain text password to verify
   * @returns True if password matches, false otherwise
   */
  static async verify(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      throw new Error(
        `Failed to verify password: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if a hash needs rehashing (e.g., parameters have changed)
   * @param hash - Stored password hash
   * @param options - Current Argon2 parameters to check against
   * @returns True if hash needs to be rehashed
   */
  static async needsRehash(hash: string, options: Argon2Options = {}): Promise<boolean> {
    const currentOptions = { ...this.DEFAULT_OPTIONS, ...options };

    try {
      return await argon2.needsRehash(hash, currentOptions);
    } catch (error) {
      return true;
    }
  }

  /**
   * Validate password strength before hashing
   * @param password - Password to validate
   * @returns Object with isValid and message
   */
  static validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
    if (!password || password.length === 0) {
      return { isValid: false, message: 'Password is required' };
    }

    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }

    if (password.length > 128) {
      return { isValid: false, message: 'Password cannot exceed 128 characters' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return {
        isValid: false,
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      };
    }

    return { isValid: true };
  }
}
