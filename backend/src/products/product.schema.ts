import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Product extends Document {
  @Prop({ required: true })
  nom: string;

  @Prop({ required: true })
  prix: number;

  @Prop()
  description?: string;

  @Prop([String])
  images?: string[];

  @Prop({ type: Object })
  specifications?: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  id_categorie: Types.ObjectId;

  @Prop({ default: Date.now })
  date_de_creation: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

