import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from '../../products/product.schema';

@Schema({ collection: 'orders', timestamps: { createdAt: 'date_commande', updatedAt: false } })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  id_utilisateur: Types.ObjectId; // même logique : provient du JWT

  @Prop({
    type: [
      {
        id_produit: { type: Types.ObjectId, ref: Product.name, required: true },
        quantite: { type: Number, required: true, min: 1 },
      },
    ],
    required: true,
  })
  liste_produits: { id_produit: Types.ObjectId; quantite: number }[];

  @Prop({ required: true, default: 'en attente' })
  statut: string; // en attente, expédiée, livrée, annulée...

  @Prop({ required: true, min: 0 })
  montant_total: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
