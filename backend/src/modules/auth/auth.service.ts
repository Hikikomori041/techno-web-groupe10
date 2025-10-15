import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/schemas/user.schema';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    // Create default admin user for testing
    await this.createDefaultAdmin();
  }

  // Create default admin for testing
  private async createDefaultAdmin() {
    const adminExists = await this.userModel.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.userModel.create({
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        provider: 'local',
        roles: [Role.ADMIN, Role.USER],
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
    const existingUser = await this.userModel.findOne({ email: registerDto.email });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create new user with default USER role
    const newUser = await this.userModel.create({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      provider: 'local',
      roles: [Role.USER], // Default role
    });

    // Generate JWT token
    const token = this.generateToken(newUser);

    // Return user without password
    const userObject = newUser.toObject();
    const { password, ...userWithoutPassword } = userObject;

    return {
      message: 'User registered successfully',
      user: userWithoutPassword,
      access_token: token,
    };
  }

  // Login user
  async login(loginDto: LoginDto) {
    // Find user by email
    const user = await this.userModel.findOne({ email: loginDto.email });

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
    const userObject = user.toObject();
    const { password, ...userWithoutPassword } = userObject;

    return {
      message: 'Login successful',
      user: userWithoutPassword,
      access_token: token,
    };
  }

  // Generate JWT token
  private generateToken(user: any): string {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
    };

    return this.jwtService.sign(payload);
  }

  // Get all users (admin only)
  async getAllUsers() {
    const users = await this.userModel.find().select('-password').exec();
    return users;
  }

  // Update user role (admin only)
  async updateUserRole(userId: string, roles: Role[]) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { roles },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  // Delete user (admin only)
  async deleteUser(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Prevent deleting the default admin
    if (user.email === 'admin@example.com') {
      throw new ForbiddenException('Cannot delete default admin');
    }

    await this.userModel.findByIdAndDelete(userId);
    return { message: 'User deleted successfully' };
  }

  // Get user profile (for protected routes)
  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
