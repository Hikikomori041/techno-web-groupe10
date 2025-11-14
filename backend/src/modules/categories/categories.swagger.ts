import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

export const GetAllCategoriesDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all categories', description: 'Retrieve all product categories (public)' }),
    ApiResponse({ status: 200, description: 'Categories retrieved successfully' }),
  );

export const GetCategoryByIdDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get category by ID', description: 'Retrieve a single category by ID' }),
    ApiResponse({ status: 200, description: 'Category retrieved successfully' }),
    ApiResponse({ status: 404, description: 'Category not found' }),
  );

export const CreateCategoryDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Create category', description: 'Create a new product category (Admin only)' }),
    ApiResponse({ status: 201, description: 'Category created successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin only' }),
    ApiResponse({ status: 409, description: 'Category name already exists' }),
  );

export const UpdateCategoryDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Update category', description: 'Update an existing category (Admin only)' }),
    ApiResponse({ status: 200, description: 'Category updated successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin only' }),
    ApiResponse({ status: 404, description: 'Category not found' }),
    ApiResponse({ status: 409, description: 'Category name already exists' }),
  );

export const DeleteCategoryDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Delete category', description: 'Delete a category (Admin only)' }),
    ApiResponse({ status: 200, description: 'Category deleted successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin only' }),
    ApiResponse({ status: 404, description: 'Category not found' }),
  );

