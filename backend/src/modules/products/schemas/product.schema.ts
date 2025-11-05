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

// Add virtual for id_categorie (frontend compatibility)
ProductSchema.virtual('id_categorie').get(function (this: any) {
  // If categoryId is populated (object with _id), return the _id as string
  if (this.categoryId && typeof this.categoryId === 'object' && this.categoryId._id) {
    return this.categoryId._id.toString();
  }
  // If categoryId is not populated (ObjectId), return it as string
  return this.categoryId ? this.categoryId.toString() : undefined;
});

// Ensure virtuals are included in JSON
ProductSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc: any, ret: any) {
    // Extract the _id from populated categoryId if it exists
    if (ret.categoryId && typeof ret.categoryId === 'object' && ret.categoryId._id) {
      ret.id_categorie = ret.categoryId._id.toString();
    } else if (ret.categoryId) {
      ret.id_categorie = ret.categoryId.toString();
    }
    return ret;
  },
});

ProductSchema.set('toObject', {
  virtuals: true,
  transform: function (doc: any, ret: any) {
    // Extract the _id from populated categoryId if it exists
    if (ret.categoryId && typeof ret.categoryId === 'object' && ret.categoryId._id) {
      ret.id_categorie = ret.categoryId._id.toString();
    } else if (ret.categoryId) {
      ret.id_categorie = ret.categoryId.toString();
    }
    return ret;
  },
});

