import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true, min: 1, default: 1 })
  quantity: number;

  @Prop({ default: Date.now })
  addedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Create compound unique index to prevent duplicate entries
CartSchema.index({ userId: 1, productId: 1 }, { unique: true });

