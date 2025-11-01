import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

export const AddToCartDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Add product to cart',
      description: 'Add a product to the authenticated user\'s cart. If the product is already in the cart, the quantity will be increased.',
    }),
    ApiBody({ type: AddToCartDto }),
    ApiResponse({
      status: 201,
      description: 'Product added to cart successfully',
      schema: {
        example: {
          _id: '67160f4a8b123456789abcde',
          userId: '507f1f77bcf86cd799439011',
          productId: {
            _id: '507f1f77bcf86cd799439012',
            nom: 'Laptop Dell XPS 15',
            prix: 1299.99,
            description: 'High-performance laptop',
            images: ['https://example.com/image.jpg'],
            id_categorie: 1,
          },
          quantity: 1,
          addedAt: '2025-10-21T12:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid input data',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - JWT token missing or invalid',
    }),
    ApiResponse({
      status: 404,
      description: 'Product not found',
    }),
  );

export const GetCartDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Get user\'s cart',
      description: 'Retrieve all items in the authenticated user\'s cart with calculated totals and subtotals.',
    }),
    ApiResponse({
      status: 200,
      description: 'Cart retrieved successfully',
      schema: {
        example: {
          items: [
            {
              _id: '67160f4a8b123456789abcde',
              productId: {
                _id: '507f1f77bcf86cd799439012',
                nom: 'Laptop Dell XPS 15',
                prix: 1299.99,
                description: 'High-performance laptop',
                images: ['https://example.com/image.jpg'],
                id_categorie: 1,
              },
              quantity: 2,
              subtotal: 2599.98,
              addedAt: '2025-10-21T12:00:00.000Z',
            },
            {
              _id: '67160f4a8b123456789abcdf',
              productId: {
                _id: '507f1f77bcf86cd799439013',
                nom: 'iPhone 14 Pro',
                prix: 999.99,
                description: 'Latest iPhone',
                images: ['https://example.com/iphone.jpg'],
                id_categorie: 2,
              },
              quantity: 1,
              subtotal: 999.99,
              addedAt: '2025-10-21T11:30:00.000Z',
            },
          ],
          total: 3599.97,
          itemCount: 3,
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - JWT token missing or invalid',
    }),
  );

export const UpdateCartItemDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Update cart item quantity',
      description: 'Update the quantity of a specific product in the cart. Set quantity to 0 to remove the item.',
    }),
    ApiParam({
      name: 'productId',
      description: 'Product ID (MongoDB ObjectId)',
      example: '507f1f77bcf86cd799439012',
    }),
    ApiBody({ type: UpdateCartItemDto }),
    ApiResponse({
      status: 200,
      description: 'Cart item updated successfully',
      schema: {
        example: {
          _id: '67160f4a8b123456789abcde',
          userId: '507f1f77bcf86cd799439011',
          productId: {
            _id: '507f1f77bcf86cd799439012',
            nom: 'Laptop Dell XPS 15',
            prix: 1299.99,
          },
          quantity: 3,
          addedAt: '2025-10-21T12:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid input data',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - JWT token missing or invalid',
    }),
    ApiResponse({
      status: 404,
      description: 'Cart item not found',
    }),
  );

export const RemoveCartItemDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Remove product from cart',
      description: 'Remove a specific product from the authenticated user\'s cart.',
    }),
    ApiParam({
      name: 'productId',
      description: 'Product ID (MongoDB ObjectId)',
      example: '507f1f77bcf86cd799439012',
    }),
    ApiResponse({
      status: 200,
      description: 'Item removed successfully',
      schema: {
        example: {
          message: 'Item removed successfully',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - JWT token missing or invalid',
    }),
    ApiResponse({
      status: 404,
      description: 'Cart item not found',
    }),
  );

export const ClearCartDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Clear entire cart',
      description: 'Remove all items from the authenticated user\'s cart.',
    }),
    ApiResponse({
      status: 200,
      description: 'Cart cleared successfully',
      schema: {
        example: {
          message: 'Cart cleared successfully',
          deletedCount: 3,
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - JWT token missing or invalid',
    }),
  );

