import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  // In-memory user storage (replace with database in production)
  private users: User[] = [];

  constructor(private jwtService: JwtService) {}

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

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      provider: 'local',
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
    };

    return this.jwtService.sign(payload);
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
