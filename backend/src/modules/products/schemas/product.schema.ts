import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  nom: string;

  @Prop({ required: true })
  prix: number;

  @Prop()
  description?: string;

  @Prop([String])
  images?: string[];

  @Prop({ 
    type: [{ key: { type: String }, value: { type: String } }], 
    default: [] 
  })
  specifications: Array<{ key: string; value: string }>;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  moderatorId?: Types.ObjectId;

  @Prop({ required: true, default: 0, min: 0 })
  quantite_en_stock: number;

  @Prop({ default: Date.now })
  date_de_creation: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

