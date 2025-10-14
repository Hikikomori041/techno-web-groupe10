import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductStats } from './product-stats.schema';

type ProductStatsLight = {
  _id: string; // même que Product
  quantite_en_stock: number;
  nombre_de_vente: number;
};

@Injectable()
export class ProductStatsService {
  constructor(
    @InjectModel(ProductStats.name)
    private statsModel: Model<ProductStats>,
  ) {}

  // Récupérer toutes les stats
  async findAll(details = false): Promise<any[]> {
    if (details) {
      const stats = await this.statsModel.find().populate('_id', '-__v').exec();
      return stats.map((s: any) => ({
        _id: s._id, // c’est le produit peuplé
        produit: s._id, // renommé pour clarté
        quantite_en_stock: s.quantite_en_stock,
        nombre_de_vente: s.nombre_de_vente,
      }));
    } else {
      return this.statsModel
        .find({}, { _id: 1, quantite_en_stock: 1, nombre_de_vente: 1 })
        .lean()
        .exec() as unknown as ProductStatsLight[];
    }
  }

  // Récupérer les stats d’un produit
  async findByProduct(id: string, details = false): Promise<any> {
    const objectId = new Types.ObjectId(id);
    if (details) {
      const stat = await this.statsModel
        .findById(objectId)
        .populate('_id', '-__v')
        .exec();
      if (!stat) return null;

      return {
        _id: id,
        produit: stat._id, // produit complet
        quantite_en_stock: stat.quantite_en_stock,
        nombre_de_vente: stat.nombre_de_vente,
      };
    } else {
      return this.statsModel
        .findById(objectId, { _id: 1, quantite_en_stock: 1, nombre_de_vente: 1 })
        .lean()
        .exec() as unknown as ProductStatsLight;
    }
  }

  // Créer une fiche de stats
  async create(stat: Partial<ProductStats>) {
    if (stat._id && typeof stat._id === 'string') {
      stat._id = new Types.ObjectId(stat._id);
    }
    return this.statsModel.create(stat);
  }

  // Mettre à jour les stats
  async updateByProduct(id: string, update: Partial<ProductStats>) {
    const objectId = new Types.ObjectId(id);
    return this.statsModel
      .findByIdAndUpdate(objectId, update, { new: true, upsert: true })
      .exec();
  }

  async incrementSales(id: string, increment = 1) {
    const objectId = new Types.ObjectId(id);
    return this.statsModel
      .findByIdAndUpdate(
        objectId,
        { $inc: { nombre_de_vente: increment } },
        { new: true, upsert: true }
      )
      .exec();
  }


  // Supprimer les stats d’un produit
  async removeByProduct(id: string) {
    const objectId = new Types.ObjectId(id);
    return this.statsModel.deleteOne({ _id: objectId }).exec();
  }
}
