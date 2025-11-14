import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '../schemas/order.schema';

class OrderItemResponseDto {
  @ApiProperty({ example: '65f0c2d5b8f86c4df0b2c1a1' })
  productId: string;

  @ApiProperty({ example: 'MacBook Pro 14' })
  productName: string;

  @ApiProperty({ example: 2499 })
  productPrice: number;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiProperty({ example: 2499 })
  subtotal: number;
}

class ShippingAddressResponseDto {
  @ApiProperty({ example: '123 Rue de la Paix' })
  street: string;

  @ApiProperty({ example: 'Paris' })
  city: string;

  @ApiProperty({ example: '75001' })
  postalCode: string;

  @ApiProperty({ example: 'France' })
  country: string;
}

export class OrderResponseDto {
  @ApiProperty({ example: '65f0c2d5b8f86c4df0b2c1a1' })
  id: string;

  @ApiProperty({ example: '65f0c2d5b8f86c4df0b2c1a1', description: 'Frontend compatibility field' })
  _id: string;

  @ApiProperty({ example: 'ORD-20240615-ABCDE' })
  orderNumber: string;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty({ example: 2499 })
  total: number;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty({ type: ShippingAddressResponseDto })
  shippingAddress: ShippingAddressResponseDto;

  @ApiProperty({ example: '65f0c2d5b8f86c4df0b2c1b2' })
  userId: string;

  @ApiProperty({ example: '2024-06-15T10:00:00.000Z' })
  createdAt?: Date;
}

