import { UserRepository } from '../repositories/user.repository';
import { PasswordService } from './password.service';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async login(
    email: string,
    password: string
  ): Promise<{
    user: {
      id: string;
      name: string;
      email: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
  } | null> {
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

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}
