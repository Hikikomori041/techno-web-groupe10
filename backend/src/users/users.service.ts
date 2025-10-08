import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { Role } from '../auth/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(private authService: AuthService) {}

  // Get all users
  async findAll() {
    return this.authService.getAllUsers();
  }

  // Get user by ID
  async findOne(id: string) {
    const user = await this.authService.getProfile(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Update user roles
  async updateRole(userId: string, roles: Role[]) {
    return this.authService.updateUserRole(userId, roles);
  }

  // Delete user
  async remove(userId: string) {
    return this.authService.deleteUser(userId);
  }
}

