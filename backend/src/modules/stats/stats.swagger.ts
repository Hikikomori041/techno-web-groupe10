import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

export const GetDashboardStatsDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Get dashboard statistics (Admin/Moderator)',
      description: 'Retrieve comprehensive statistics including revenue, orders, products, users, and charts data. Moderators see only their own products and related orders.',
    }),
    ApiResponse({
      status: 200,
      description: 'Dashboard statistics retrieved successfully',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin/Moderator only' }),
  );

