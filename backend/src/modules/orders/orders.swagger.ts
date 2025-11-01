import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';

export const CreateOrderDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Create order from cart',
      description: 'Create a new order from the user\'s cart items. Validates stock, reduces inventory, and clears cart.',
    }),
    ApiBody({ type: CreateOrderDto }),
    ApiResponse({
      status: 201,
      description: 'Order created successfully',
      schema: {
        example: {
          _id: '67160f4a8b123456789abcde',
          userId: '507f1f77bcf86cd799439011',
          orderNumber: 'ORD-20251021-A1B2C',
          items: [
            {
              productId: '507f1f77bcf86cd799439012',
              productName: 'Laptop Dell XPS 15',
              productPrice: 1299.99,
              quantity: 2,
              subtotal: 2599.98,
            },
          ],
          total: 2599.98,
          status: 'pending',
          paymentStatus: 'pending',
          shippingAddress: {
            street: '123 Rue de la Paix',
            city: 'Paris',
            postalCode: '75001',
            country: 'France',
          },
          createdAt: '2025-10-21T12:00:00.000Z',
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Cart empty or insufficient stock' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );

export const GetUserOrdersDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Get user\'s orders',
      description: 'Retrieve all orders for the authenticated user, sorted by most recent.',
    }),
    ApiResponse({
      status: 200,
      description: 'List of user orders',
      schema: {
        example: [
          {
            _id: '67160f4a8b123456789abcde',
            orderNumber: 'ORD-20251021-A1B2C',
            total: 2599.98,
            status: 'preparation',
            paymentStatus: 'paid',
            createdAt: '2025-10-21T12:00:00.000Z',
          },
        ],
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );

export const GetOrderByIdDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Get order details',
      description: 'Get detailed information about a specific order. Users can only view their own orders.',
    }),
    ApiParam({ name: 'id', description: 'Order ID' }),
    ApiResponse({
      status: 200,
      description: 'Order details',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Not your order' }),
    ApiResponse({ status: 404, description: 'Order not found' }),
  );

export const GetAllOrdersDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Get all orders (Admin/Moderator)',
      description: 'Retrieve all orders from all users. Admin and Moderator only.',
    }),
    ApiResponse({
      status: 200,
      description: 'List of all orders',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin/Moderator only' }),
  );

export const UpdateOrderStatusDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Update order status (Admin/Moderator)',
      description: 'Update the status of an order. Cannot modify delivered or cancelled orders.',
    }),
    ApiParam({ name: 'id', description: 'Order ID' }),
    ApiBody({ type: UpdateOrderStatusDto }),
    ApiResponse({
      status: 200,
      description: 'Order status updated',
    }),
    ApiResponse({ status: 400, description: 'Invalid status transition' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin/Moderator only' }),
    ApiResponse({ status: 404, description: 'Order not found' }),
  );

export const UpdatePaymentStatusDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Update payment status (Admin/Moderator)',
      description: 'Update the payment status of an order.',
    }),
    ApiParam({ name: 'id', description: 'Order ID' }),
    ApiBody({ type: UpdatePaymentStatusDto }),
    ApiResponse({
      status: 200,
      description: 'Payment status updated',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin/Moderator only' }),
    ApiResponse({ status: 404, description: 'Order not found' }),
  );

export const CancelOrderDocs = () =>
  applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Cancel order',
      description: 'Cancel an order before it ships. Stock quantities are restored.',
    }),
    ApiParam({ name: 'id', description: 'Order ID' }),
    ApiResponse({
      status: 200,
      description: 'Order cancelled successfully',
    }),
    ApiResponse({ status: 400, description: 'Cannot cancel shipped/delivered orders' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Not your order' }),
    ApiResponse({ status: 404, description: 'Order not found' }),
  );

