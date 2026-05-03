import { UserRepository } from '../repositories/user.repository';
import { PasswordService } from './password.service';
import { JWTService, TokenResponse } from './jwt.service';
import RedisService from './redis.service';
import { randomBytes } from 'crypto';

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

export interface SessionData {
  tokenId: string;
  createdAt: string;
  userAgent?: string;
  ipAddress?: string;
}

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  private generateTokenId(): string {
    return randomBytes(32).toString('hex');
  }

  async login(email: string, password: string): Promise<LoginResponse | null> {
    const user = await this.userRepository.findByEmailWithPassword(email);

    if (!user || !user.isActive) {
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

    const tokenId = this.generateTokenId();
    const tokens = JWTService.generateTokens(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      tokenId
    );

    await RedisService.hset(`user:${user.id}:tokens`, tokenId, {
      tokenId,
      createdAt: new Date().toISOString(),
      userAgent: 'user-agent-to-be-added',
      ipAddress: 'ip-to-be-added',
    });

    await RedisService.set(
      `user:${user.id}:profile`,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
      3600
    );

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

      const isBlacklisted = await RedisService.exists(`blacklist:token:${decoded.jti}`);
      if (isBlacklisted) {
        return null;
      }

      const user = await this.userRepository.findById(decoded.id);

      if (!user || !user.isActive) {
        return null;
      }

      const newTokenId = this.generateTokenId();
      const newTokens = JWTService.generateTokens(
        {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        newTokenId
      );

      await RedisService.hset(`user:${user.id}:tokens`, newTokenId, {
        tokenId: newTokenId,
        createdAt: new Date().toISOString(),
      });

      await RedisService.hdel(`user:${user.id}:tokens`, decoded.jti);

      await RedisService.set(`blacklist:token:${decoded.jti}`, 'revoked', 2592000);

      return newTokens;
    } catch {
      return null;
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const decoded = JWTService.decodeToken(refreshToken);

    if (decoded && decoded.jti) {
      await RedisService.set(`blacklist:token:${decoded.jti}`, 'revoked', 2592000);

      await RedisService.hdel(`user:${userId}:tokens`, decoded.jti);
    }

    await RedisService.del(`user:${userId}:profile`);
  }

  async logoutAllDevices(userId: string): Promise<void> {
    const tokens = await RedisService.hgetall<SessionData>(`user:${userId}:tokens`);

    for (const tokenId of Object.keys(tokens)) {
      await RedisService.set(`blacklist:token:${tokenId}`, 'revoked', 2592000);
    }

    await RedisService.del(`user:${userId}:tokens`);

    await RedisService.del(`user:${userId}:profile`);
  }

  async getActiveSessions(userId: string): Promise<SessionData[]> {
    const sessions = await RedisService.hgetall<SessionData>(`user:${userId}:tokens`);
    return Object.values(sessions);
  }
}
