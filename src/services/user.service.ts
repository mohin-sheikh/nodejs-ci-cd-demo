import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/User';
import { PasswordService } from './password.service';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const passwordValidation = PasswordService.validatePasswordStrength(userData.password!);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    const existingUser = await this.userRepository.findByEmail(userData.email!);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await PasswordService.hash(userData.password!);

    const userToCreate = {
      ...userData,
      password: hashedPassword,
    };

    return await this.userRepository.create(userToCreate);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (userData.password) {
      const passwordValidation = PasswordService.validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }

      userData.password = await PasswordService.hash(userData.password);
    }

    return await this.userRepository.update(id, userData);
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return await this.userRepository.delete(id);
  }

  async validateUserCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmailWithPassword(email);
    if (!user) {
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

    const userWithoutPassword: Partial<User> = {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return userWithoutPassword as User;
  }
}
