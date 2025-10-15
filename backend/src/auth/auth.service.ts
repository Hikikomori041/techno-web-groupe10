import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/user.entity';
import { Role } from './enums/role.enum';

@Injectable()
export class AuthService {
  // In-memory user storage (replace with database in production)
  private users: User[] = [];

  constructor(private jwtService: JwtService) {
    // Create default admin user for testing
    this.createDefaultAdmin();
  }

  // Create default admin for testing
  private async createDefaultAdmin() {
    const adminExists = this.users.find((u) => u.email === 'admin@example.com');
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      this.users.push({
        id: 'admin-001',
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        provider: 'local',
        roles: [Role.ADMIN, Role.USER],
        createdAt: new Date(),
      });
    }
  }

  // Google OAuth Login
  googleLogin(req) {
    if (!req.user) {
      return { message: 'No user from google' };
    }

    return {
      message: 'User information from google',
      user: req.user,
    };
  }

  // Register new user
  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = this.users.find(
      (user) => user.email === registerDto.email,
    );

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create new user with default USER role
    const newUser: User = {
      id: Date.now().toString(),
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      provider: 'local',
      roles: [Role.USER], // Default role
      createdAt: new Date(),
    };

    this.users.push(newUser);

    // Generate JWT token
    const token = this.generateToken(newUser);

    // Return user without password
    const { password, ...userWithoutPassword } = newUser;

    return {
      message: 'User registered successfully',
      user: userWithoutPassword,
      access_token: token,
    };
  }

  // Login user
  async login(loginDto: LoginDto) {
    // Find user by email
    const user = this.users.find((user) => user.email === loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    return {
      message: 'Login successful',
      user: userWithoutPassword,
      access_token: token,
    };
  }

  // Generate JWT token
  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
    };

    return this.jwtService.sign(payload);
  }

  // Get all users (admin only)
  async getAllUsers() {
    return this.users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  // Update user role (admin only)
  async updateUserRole(userId: string, roles: Role[]) {
    const user = this.users.find((u) => u.id === userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.roles = roles;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Delete user (admin only)
  async deleteUser(userId: string) {
    const userIndex = this.users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      throw new UnauthorizedException('User not found');
    }

    // Prevent deleting the default admin
    if (this.users[userIndex].id === 'admin-001') {
      throw new ForbiddenException('Cannot delete default admin');
    }

    this.users.splice(userIndex, 1);
    return { message: 'User deleted successfully' };
  }

  // Get user profile (for protected routes)
  async getProfile(userId: string) {
    const user = this.users.find((user) => user.id === userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
