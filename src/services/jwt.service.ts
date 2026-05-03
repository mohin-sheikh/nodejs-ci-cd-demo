import jwt, { SignOptions } from 'jsonwebtoken';

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  jti: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export class JWTService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
  private static readonly JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || 'default-refresh-key';
  private static readonly JWT_EXPIRES_IN: SignOptions['expiresIn'] =
    (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '7d';
  private static readonly JWT_REFRESH_EXPIRES_IN: SignOptions['expiresIn'] =
    (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn']) || '30d';

  static generateTokens(payload: Omit<TokenPayload, 'jti'>, tokenId: string): TokenResponse {
    const fullPayload: TokenPayload = { ...payload, jti: tokenId };

    const accessToken = jwt.sign(fullPayload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(fullPayload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: String(this.JWT_EXPIRES_IN),
    };
  }

  static verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw new Error('Authentication failed');
    }
  }

  static verifyRefreshToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_REFRESH_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      throw new Error('Invalid refresh token');
    }
  }

  static decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }
}
