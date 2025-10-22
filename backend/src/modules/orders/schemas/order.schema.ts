import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OrderStatus {
  PENDING = 'pending',
  PREPARATION = 'preparation',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  productPrice: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true })
  subtotal: number;
}

@Schema({ _id: false })
export class ShippingAddress {
  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  postalCode: string;

  @Prop({ required: true })
  country: string;
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  total: number;

  @Prop({ 
    type: String, 
    enum: Object.values(OrderStatus), 
    default: OrderStatus.PENDING 
  })
  status: OrderStatus;

  @Prop({ 
    type: String, 
    enum: Object.values(PaymentStatus), 
    default: PaymentStatus.PENDING 
  })
  paymentStatus: PaymentStatus;

  @Prop({ type: ShippingAddress, required: true })
  shippingAddress: ShippingAddress;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Create index on userId for fast user order lookup
OrderSchema.index({ userId: 1, createdAt: -1 });

