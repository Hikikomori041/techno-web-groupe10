import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

  @Prop({ required: true })
  id_categorie: number;

  @Prop({ default: Date.now })
  date_de_creation: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

