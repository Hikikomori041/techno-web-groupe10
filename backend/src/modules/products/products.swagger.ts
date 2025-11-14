import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export const GetAllProductsDocs = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Get all products',
      description: 'Retrieve a list of all products in the database. No authentication required.',
    }),
    ApiResponse({
      status: 200,
      description: 'List of all products',
      schema: {
        example: [
          {
            _id: '507f1f77bcf86cd799439011',
            nom: 'Laptop Dell XPS 15',
            prix: 1299.99,
            description: 'High-performance laptop with 15-inch display',
            images: ['https://example.com/image1.jpg'],
            specifications: {
              processor: 'Intel Core i7-11800H',
              ram: '16GB DDR4',
              storage: '512GB SSD',
            },
            id_categorie: 1,
            date_de_creation: '2025-10-21T12:00:00.000Z',
          },
          {
            _id: '507f1f77bcf86cd799439012',
            nom: 'iPhone 14 Pro',
            prix: 999.99,
            description: 'Latest iPhone with A16 Bionic chip',
            images: ['https://example.com/iphone.jpg'],
            specifications: {
              screen: '6.1-inch',
              storage: '256GB',
              camera: '48MP',
            },
            id_categorie: 2,
            date_de_creation: '2025-10-21T12:00:00.000Z',
          },
        ],
      },
    }),
  );

export const GetAllProductsWithFiltersDocs = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Get all products with filters and pagination', 
      description: 'Retrieve products with optional filters (category, price range, search, stock status, specifications) and pagination support' 
    }),
    ApiResponse({
      status: 200,
      description: 'Products retrieved successfully with pagination info',
      schema: {
        type: 'object',
        properties: {
          products: { type: 'array', items: { type: 'object' } },
          total: { type: 'number', example: 50 },
          page: { type: 'number', example: 1 },
          limit: { type: 'number', example: 12 },
          totalPages: { type: 'number', example: 5 },
          hasMore: { type: 'boolean', example: true },
        },
      },
    }),
  );

export const GenerateDescriptionDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Generate AI description for product', description: 'Generate an AI-powered description for an existing product' }),
    ApiResponse({ status: 200, description: 'Description generated successfully', schema: { type: 'object', properties: { description: { type: 'string' } } } }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin/Moderator only' }),
    ApiResponse({ status: 404, description: 'Product not found' }),
  );

export const GetProductByIdDocs = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Get product by ID',
      description: 'Retrieve detailed information about a specific product. No authentication required.',
    }),
    ApiParam({ 
      name: 'id', 
      description: 'Product ID (MongoDB ObjectId)',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({
      status: 200,
      description: 'Product details',
      schema: {
        example: {
          _id: '507f1f77bcf86cd799439011',
          nom: 'Laptop Dell XPS 15',
          prix: 1299.99,
          description: 'High-performance laptop with 15-inch display',
          images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
          specifications: {
            processor: 'Intel Core i7-11800H',
            ram: '16GB DDR4',
            storage: '512GB SSD',
            display: '15.6" FHD',
            weight: '1.8 kg',
          },
          id_categorie: 1,
          date_de_creation: '2025-10-21T12:00:00.000Z',
        },
      },
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Product not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Product not found',
        },
      },
    }),
  );

export const CreateProductDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ 
      summary: 'Create new product (Admin/Moderator only)',
      description: 'Create a new product and automatically initialize its statistics. Requires authentication and Admin or Moderator role.',
    }),
    ApiBody({ type: CreateProductDto }),
    ApiResponse({
      status: 201,
      description: 'Product created successfully',
      schema: {
        example: {
          _id: '507f1f77bcf86cd799439011',
          nom: 'Laptop Dell XPS 15',
          prix: 1299.99,
          description: 'High-performance laptop with 15-inch display',
          images: ['https://example.com/image1.jpg'],
          specifications: {
            processor: 'Intel Core i7-11800H',
            ram: '16GB DDR4',
            storage: '512GB SSD',
          },
          id_categorie: 1,
          date_de_creation: '2025-10-21T12:00:00.000Z',
        },
      },
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Invalid input data',
      schema: {
        example: {
          statusCode: 400,
          message: ['prix must not be less than 0', 'nom should not be empty'],
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized - JWT token missing or invalid' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin or Moderator role required' }),
  );

export const UpdateProductDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ 
      summary: 'Update product (Admin/Moderator only)',
      description: 'Update an existing product\'s information. All fields are optional. Requires authentication and Admin or Moderator role.',
    }),
    ApiParam({ 
      name: 'id', 
      description: 'Product ID (MongoDB ObjectId)',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiBody({ type: UpdateProductDto }),
    ApiResponse({
      status: 200,
      description: 'Product updated successfully',
      schema: {
        example: {
          _id: '507f1f77bcf86cd799439011',
          nom: 'Laptop Dell XPS 15 (Updated)',
          prix: 1199.99,
          description: 'Updated description with new features',
          images: ['https://example.com/new-image.jpg'],
          specifications: {
            processor: 'Intel Core i7-12700H',
            ram: '32GB DDR5',
          },
          id_categorie: 1,
          date_de_creation: '2025-10-21T12:00:00.000Z',
        },
      },
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Invalid input data',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized - JWT token missing or invalid' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin or Moderator role required' }),
    ApiResponse({ 
      status: 404, 
      description: 'Product not found',
    }),
  );

export const DeleteProductDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ 
      summary: 'Delete product (Admin/Moderator only)',
      description: 'Permanently delete a product from the database. Requires authentication and Admin or Moderator role.',
    }),
    ApiParam({ 
      name: 'id', 
      description: 'Product ID (MongoDB ObjectId)',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({
      status: 200,
      description: 'Product deleted successfully',
      schema: {
        example: {
          _id: '507f1f77bcf86cd799439011',
          nom: 'Laptop Dell XPS 15',
          prix: 1299.99,
          description: 'High-performance laptop',
          id_categorie: 1,
          date_de_creation: '2025-10-21T12:00:00.000Z',
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized - JWT token missing or invalid' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin or Moderator role required' }),
    ApiResponse({ 
      status: 404, 
      description: 'Product not found',
    }),
  );

