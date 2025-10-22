import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('stats')
@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MODERATOR)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get dashboard statistics (Admin/Moderator)',
    description: 'Retrieve comprehensive statistics including revenue, orders, products, users, and charts data. Moderators see only their own products and related orders.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin/Moderator only' })
  async getDashboardStats(@Request() req) {
    const userId = req.user.userId;
    const userRoles = req.user.roles;
    return this.statsService.getDashboardStats(userId, userRoles);
  }
}

