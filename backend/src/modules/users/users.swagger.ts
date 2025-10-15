import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UpdateRoleDto } from '../auth/dto/update-role.dto';

export const GetAllUsersDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get all users (Admin only)' }),
    ApiResponse({
      status: 200,
      description: 'List of all users',
      schema: {
        example: [
          {
            id: 'admin-001',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            provider: 'local',
            roles: ['admin', 'user'],
            createdAt: '2025-10-08T12:00:00.000Z',
          },
          {
            id: '1234567890',
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
            provider: 'local',
            roles: ['user'],
            createdAt: '2025-10-08T12:00:00.000Z',
          },
        ],
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin role required' }),
  );

export const GetUserByIdDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get user by ID (Admin only)' }),
    ApiParam({ name: 'id', description: 'User ID' }),
    ApiResponse({
      status: 200,
      description: 'User details',
      schema: {
        example: {
          id: '1234567890',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          provider: 'local',
          roles: ['user'],
          createdAt: '2025-10-08T12:00:00.000Z',
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin role required' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );

export const UpdateUserRoleDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Update user roles (Admin only)' }),
    ApiParam({ name: 'id', description: 'User ID' }),
    ApiBody({ type: UpdateRoleDto }),
    ApiResponse({
      status: 200,
      description: 'User roles updated successfully',
      schema: {
        example: {
          id: '1234567890',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          provider: 'local',
          roles: ['user', 'moderator'],
          createdAt: '2025-10-08T12:00:00.000Z',
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin role required' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );

export const DeleteUserDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Delete user (Admin only)' }),
    ApiParam({ name: 'id', description: 'User ID' }),
    ApiResponse({
      status: 200,
      description: 'User deleted successfully',
      schema: {
        example: {
          message: 'User deleted successfully',
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Cannot delete admin or requires admin role',
    }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );

