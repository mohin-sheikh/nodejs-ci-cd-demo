import { UserRepository } from '../repositories/user.repository';
import { PasswordService } from './password.service';
import { JWTService, TokenResponse } from './jwt.service';

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  tokens: TokenResponse;
}

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async login(email: string, password: string): Promise<LoginResponse | null> {
    const user = await this.userRepository.findByEmailWithPassword(email);

    if (!user) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    const isValid = await PasswordService.verify(user.password, password);
    if (!isValid) {
      return null;
    }

    if (await PasswordService.needsRehash(user.password)) {
      const newHash = await PasswordService.hash(password);
      await this.userRepository.update(user.id, { password: newHash });
    }

    // Generate JWT tokens
    const tokens = JWTService.generateTokens({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse | null> {
    try {
      const decoded = JWTService.verifyRefreshToken(refreshToken);
      const user = await this.userRepository.findById(decoded.id);

      if (!user || !user.isActive) {
        return null;
      }

      const newTokens = JWTService.generateTokens({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      return newTokens;
    } catch {
      return null;
    }
  }
}
