import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'categories', timestamps: true })
export class Category extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: false })
  id_categorie_mere?: Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
