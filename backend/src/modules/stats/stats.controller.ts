import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { GetDashboardStatsDocs } from './stats.swagger';

@ApiTags('stats')
@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MODERATOR)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @GetDashboardStatsDocs()
  async getDashboardStats(@Request() req) {
    const userId = req.user.userId;
    const userRoles = req.user.roles;
    return this.statsService.getDashboardStats(userId, userRoles);
  }
}

