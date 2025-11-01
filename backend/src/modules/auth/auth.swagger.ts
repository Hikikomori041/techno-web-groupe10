import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export const GoogleAuthDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Initiate Google OAuth login' }),
    ApiResponse({ status: 302, description: 'Redirects to Google OAuth' }),
  );

export const GoogleRedirectDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Google OAuth callback' }),
    ApiResponse({
      status: 302,
      description: 'Redirects to frontend with user data',
    }),
  );

export const RegisterDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register new user with email and password' }),
    ApiBody({ type: RegisterDto }),
    ApiResponse({
      status: 201,
      description: 'User successfully registered',
      schema: {
        example: {
          message: 'User registered successfully',
          user: {
            id: '1234567890',
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
            provider: 'local',
            createdAt: '2025-10-08T12:00:00.000Z',
          },
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    }),
    ApiResponse({ status: 409, description: 'Email already exists' }),
  );

export const LoginDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Login with email and password' }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 200,
      description: 'Login successful',
      schema: {
        example: {
          message: 'Login successful',
          user: {
            id: '1234567890',
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
            provider: 'local',
            createdAt: '2025-10-08T12:00:00.000Z',
          },
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Invalid credentials' }),
  );

export const GetProfileDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get user profile (requires JWT token)' }),
    ApiResponse({
      status: 200,
      description: 'User profile retrieved',
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
  );

export const LogoutDocs = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Logout user',
      description: 'Clear the authentication cookie to log out the user. No authentication required.',
    }),
    ApiResponse({
      status: 200,
      description: 'User logged out successfully',
      schema: {
        example: {
          message: 'Logged out successfully',
        },
      },
    }),
  );

export const CheckAuthDocs = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Check authentication status',
      description: 'Verify if the user is authenticated and retrieve their profile. Uses JWT token from cookie.',
    }),
    ApiResponse({
      status: 200,
      description: 'User is authenticated',
      schema: {
        example: {
          authenticated: true,
          user: {
            _id: '1234567890',
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
            provider: 'local',
            roles: ['user'],
            createdAt: '2025-10-08T12:00:00.000Z',
          },
        },
      },
    }),
    ApiResponse({ 
      status: 401, 
      description: 'User is not authenticated',
      schema: {
        example: {
          authenticated: false,
        },
      },
    }),
  );

