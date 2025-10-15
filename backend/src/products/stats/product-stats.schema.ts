import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class ProductStats extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  id_produit: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  quantite_en_stock: number;

  @Prop({ required: true, default: 0 })
  nombre_de_vente: number;
}

export const ProductStatsSchema = SchemaFactory.createForClass(ProductStats);


