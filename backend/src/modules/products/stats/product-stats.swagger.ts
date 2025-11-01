import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UpdateQuantityDto } from './dto/update-quantity.dto';
import { IncrementSalesDto } from './dto/increment-sales.dto';
import { RestockDto } from './dto/restock.dto';

export const GetAllStatsDocs = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Get all product statistics',
      description: 'Retrieve statistics for all products. Use ?details=true to include full product information.',
    }),
    ApiQuery({
      name: 'details',
      required: false,
      type: String,
      description: 'Set to "true" to include full product details',
      example: 'true',
    }),
    ApiResponse({
      status: 200,
      description: 'List of all product statistics',
      schema: {
        example: [
          {
            _id: '507f1f77bcf86cd799439011',
            quantite_en_stock: 50,
            nombre_de_vente: 125,
            productDetails: {
              nom: 'Laptop Dell XPS 15',
              prix: 1299.99,
              description: 'High-performance laptop',
              id_categorie: 1,
            },
          },
          {
            _id: '507f1f77bcf86cd799439012',
            quantite_en_stock: 30,
            nombre_de_vente: 200,
            productDetails: {
              nom: 'iPhone 14 Pro',
              prix: 999.99,
              description: 'Latest iPhone',
              id_categorie: 2,
            },
          },
        ],
      },
    }),
  );

export const GetStatsByProductDocs = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Get statistics for a specific product',
      description: 'Retrieve stock quantity and sales count for a specific product. Use ?details=true to include full product information.',
    }),
    ApiParam({ 
      name: 'id', 
      description: 'Product ID (MongoDB ObjectId)',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiQuery({
      name: 'details',
      required: false,
      type: String,
      description: 'Set to "true" to include full product details',
      example: 'true',
    }),
    ApiResponse({
      status: 200,
      description: 'Product statistics',
      schema: {
        example: {
          _id: '507f1f77bcf86cd799439011',
          quantite_en_stock: 50,
          nombre_de_vente: 125,
          productDetails: {
            nom: 'Laptop Dell XPS 15',
            prix: 1299.99,
            description: 'High-performance laptop with 15-inch display',
            images: ['https://example.com/image1.jpg'],
            specifications: {
              processor: 'Intel Core i7-11800H',
              ram: '16GB DDR4',
            },
            id_categorie: 1,
            date_de_creation: '2025-10-21T12:00:00.000Z',
          },
        },
      },
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Product statistics not found',
    }),
  );

export const UpdateQuantityDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ 
      summary: 'Update product stock quantity (Admin/Moderator only)',
      description: 'Set the stock quantity to a specific value. Requires authentication and Admin or Moderator role.',
    }),
    ApiParam({ 
      name: 'id_produit', 
      description: 'Product ID (MongoDB ObjectId)',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiBody({ type: UpdateQuantityDto }),
    ApiResponse({
      status: 200,
      description: 'Stock quantity updated successfully',
      schema: {
        example: {
          _id: '507f1f77bcf86cd799439011',
          quantite_en_stock: 50,
          nombre_de_vente: 125,
        },
      },
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Invalid input data',
      schema: {
        example: {
          statusCode: 400,
          message: ['quantite_en_stock must not be less than 0'],
          error: 'Bad Request',
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

export const IncrementSalesDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ 
      summary: 'Increment sales count (Admin/Moderator only)',
      description: 'Increment the number of sales for a product. Default increment is 1. Requires authentication and Admin or Moderator role.',
    }),
    ApiParam({ 
      name: 'id_produit', 
      description: 'Product ID (MongoDB ObjectId)',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiBody({ type: IncrementSalesDto }),
    ApiResponse({
      status: 200,
      description: 'Sales count incremented successfully',
      schema: {
        example: {
          _id: '507f1f77bcf86cd799439011',
          quantite_en_stock: 50,
          nombre_de_vente: 126,
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

export const RestockDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ 
      summary: 'Restock product (Admin/Moderator only)',
      description: 'Add a specific quantity to the current stock. The quantity is added to existing stock, not replaced. Requires authentication and Admin or Moderator role.',
    }),
    ApiParam({ 
      name: 'id_produit', 
      description: 'Product ID (MongoDB ObjectId)',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiBody({ type: RestockDto }),
    ApiResponse({
      status: 200,
      description: 'Product restocked successfully',
      schema: {
        example: {
          _id: '507f1f77bcf86cd799439011',
          quantite_en_stock: 70,
          nombre_de_vente: 125,
        },
      },
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Invalid input data',
      schema: {
        example: {
          statusCode: 400,
          message: ['quantity must not be less than 1'],
          error: 'Bad Request',
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

