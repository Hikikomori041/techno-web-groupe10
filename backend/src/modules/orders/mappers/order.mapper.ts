import { Order } from '../schemas/order.schema';
import { CreateOrderDto } from '../dto/create-order.dto';
import { CreateOrderInput } from '../types/order.types';
import { OrderResponseDto } from '../dto/order-response.dto';

const normalize = (value: string): string => value.trim();

export class OrderMapper {
  static fromCreateDto(dto: CreateOrderDto): CreateOrderInput {
    const address = dto.shippingAddress;
    return {
      shippingAddress: {
        street: normalize(address.street),
        city: normalize(address.city),
        postalCode: normalize(address.postalCode),
        country: normalize(address.country),
      },
    };
  }

  static toResponse(order: Order): OrderResponseDto {
    const plain = typeof order.toObject === 'function' ? order.toObject() : order;
    const orderId = plain._id?.toString?.() ?? plain.id;
    return {
      id: orderId,
      _id: orderId, // Add _id for frontend compatibility
      orderNumber: plain.orderNumber,
      items: (plain.items ?? []).map(item => ({
        productId:
          typeof item.productId === 'object' && item.productId?._id
            ? item.productId._id.toString()
            : item.productId?.toString?.(),
        productName: item.productName,
        productPrice: item.productPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      total: plain.total,
      status: plain.status,
      paymentStatus: plain.paymentStatus,
      shippingAddress: plain.shippingAddress,
      userId:
        typeof plain.userId === 'object' && plain.userId?._id
          ? plain.userId._id.toString()
          : plain.userId?.toString?.(),
      createdAt: plain.createdAt,
    };
  }

  static toResponseList(orders: Order[]): OrderResponseDto[] {
    return orders.map(order => this.toResponse(order));
  }
}

