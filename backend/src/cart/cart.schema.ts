import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from '../products/product.schema';

@Schema({ collection: 'carts' })
export class Cart extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  id_utilisateur: Types.ObjectId; // vient du JWT ou d'un utilisateur existant

  @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
  id_produit: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantite: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
