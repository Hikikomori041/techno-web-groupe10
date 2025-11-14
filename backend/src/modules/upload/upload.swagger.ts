import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

export const UploadImageDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Upload product image', description: 'Upload an image for a product (Admin/Moderator only)' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Image uploaded successfully',
      schema: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          filename: { type: 'string' },
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Invalid file type' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin/Moderator only' }),
  );

